// src/time-management/services/holidays.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Holiday } from '../Models/holiday.schema';
import { Model } from 'mongoose';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
      @InjectModel(Holiday.name)
      private readonly model: Model<Holiday>,
  ) {}

  createHoliday(dto: CreateHolidayDto) {
    return this.model.create(dto);
  }

  findAll() {
    return this.model.find().lean();
  }

  findById(id: string) {
    return this.model.findById(id).lean();
  }

  update(id: string, dto: UpdateHolidayDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
