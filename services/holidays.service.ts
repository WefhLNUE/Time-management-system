import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(@InjectModel('Holiday') private readonly holidayModel: Model<any>) {}

  async createHoliday(dto: CreateHolidayDto) {
    const doc = await this.holidayModel.create({
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      description: dto.description || '',
      createdAt: new Date(),
    });
    return doc.toObject();
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
    if (dto.name) doc.name = dto.name;
    if (dto.startDate) doc.startDate = new Date(dto.startDate);
    if (dto.endDate) doc.endDate = new Date(dto.endDate);
    if (dto.description) doc.description = dto.description;
    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    const doc = await this.holidayModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Holiday not found');
    return { deleted: true };
  }

  // Utility: check if a date is holiday
  async isHoliday(date: Date) {
    const d = new Date(date);
    return this.holidayModel.exists({
      startDate: { $lte: d },
      endDate: { $gte: d },
    });
  }
}
