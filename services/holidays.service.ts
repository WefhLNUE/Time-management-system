import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { Holiday } from '../Models/holiday.schema';

@Injectable()
export class HolidaysService {
  constructor(
      @InjectModel(Holiday.name)
      private readonly holidayModel: Model<Holiday>,
  ) {}

  async createHoliday(dto: CreateHolidayDto) {
    const doc = await this.holidayModel.create({
      name: dto.name,
      type: dto.type,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      active: dto.active ?? true,
    });

    return doc.toObject();
  }

  async findAll() {
    return this.holidayModel
        .find({ active: true })
        .sort({ startDate: 1 })
        .lean();
  }

  async findById(id: string) {
    const doc = await this.holidayModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Holiday not found');
    return doc;
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const doc = await this.holidayModel.findById(id);
    if (!doc) throw new NotFoundException('Holiday not found');

    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.type !== undefined) doc.type = dto.type;
    if (dto.startDate !== undefined)
      doc.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      doc.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.active !== undefined) doc.active = dto.active;

    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    const doc = await this.holidayModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Holiday not found');
    return { deleted: true };
  }

  /**
   * Utility: check if a date falls on a holiday
   */
  async isHoliday(date: Date): Promise<boolean> {
    const d = new Date(date);

    const exists = await this.holidayModel.exists({
      active: true,
      startDate: { $lte: d },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: d } },
      ],
    });

    return !!exists;
  }
}
