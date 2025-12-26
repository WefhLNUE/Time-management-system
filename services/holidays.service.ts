import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { Calendar } from '../../leaves/Models/calendar.schema';

@Injectable()
export class HolidaysService {
  constructor(
      @InjectModel('Holiday')
      private readonly holidayModel: Model<any>,
      @InjectModel(Calendar.name)
      private readonly calendarModel: Model<Calendar>,
  ) {}

  async createHoliday(dto: CreateHolidayDto) {
    const doc = await this.holidayModel.create({
      name: dto.name,
      type: dto.type,
      startDate: new Date(dto.startDate),
      ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      active: true,
    });

    // Sync with leaves calendar - add to the calendar for the year of this holiday
    await this.syncHolidayToCalendar(doc);

    return doc.toObject();
  }

  /**
   * Sync a holiday to the appropriate calendar(s) in the leaves module
   */
  private async syncHolidayToCalendar(holiday: any) {
    const holidayYear = new Date(holiday.startDate).getFullYear();

    // Find or create calendar for this year
    let calendar = await this.calendarModel.findOne({ year: holidayYear }).exec();

    if (!calendar) {
      // Create a new calendar for this year if it doesn't exist
      calendar = await this.calendarModel.create({
        year: holidayYear,
        holidays: [holiday._id],
        blockedPeriods: [],
      });
    } else {
      // Add holiday to existing calendar if not already present
      if (!calendar.holidays.includes(holiday._id)) {
        calendar.holidays.push(holiday._id);
        await calendar.save();
      }
    }
  }

  async findAll() {
    return this.holidayModel.find().sort({ startDate: -1 }).lean();
  }

  async findById(id: string) {
    const doc = await this.holidayModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Holiday not found');
    return doc;
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const doc = await this.holidayModel.findById(id);
    if (!doc) throw new NotFoundException('Holiday not found');

    const oldYear = new Date(doc.startDate).getFullYear();

    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.startDate) doc.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) {
      doc.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    }
    if (dto.active !== undefined) doc.active = dto.active;

    await doc.save();

    // If the year changed, update calendar references
    if (dto.startDate) {
      const newYear = new Date(doc.startDate).getFullYear();
      if (oldYear !== newYear) {
        // Remove from old calendar
        await this.calendarModel.updateOne(
          { year: oldYear },
          { $pull: { holidays: doc._id } }
        ).exec();

        // Add to new calendar
        await this.syncHolidayToCalendar(doc);
      }
    }

    return doc.toObject();
  }

  async remove(id: string) {
    const doc = await this.holidayModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Holiday not found');

    // Remove from all calendars
    await this.calendarModel.updateMany(
      {},
      { $pull: { holidays: doc._id } }
    ).exec();

    return { deleted: true };
  }

  async isHoliday(date: Date) {
    return this.holidayModel.exists({
      active: true,
      startDate: { $lte: date },
      $or: [
        { endDate: { $gte: date } },
        { endDate: { $exists: false } },
      ],
    });
  }
}