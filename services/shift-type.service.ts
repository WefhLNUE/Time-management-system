import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftTypeDocument } from '../Models/shift-type.schema';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';

@Injectable()
export class ShiftTypeService {
  constructor(@InjectModel('ShiftType') private readonly model: Model<ShiftTypeDocument>) {}

  async create(dto: CreateShiftTypeDto) {
    return this.model.create(dto);
  }

  async findAll() {
    return this.model.find({}).lean();
  }

  async update(id: string, dto: UpdateShiftTypeDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!doc) throw new NotFoundException('ShiftType not found');
    return doc;
  }
}
