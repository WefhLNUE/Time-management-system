import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftDocument } from '../Models/shift.schema';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(@InjectModel('Shift') private readonly model: Model<ShiftDocument>) {}

  private isOvernight(start: string, end: string) {
    // simple check: end <= start => overnight
    return end <= start;
  }

  async create(dto: CreateShiftDto) {
      dto.graceInMinutes ??= 0;
      dto.graceOutMinutes ??= 0;
    // basic validations
    if (dto.graceInMinutes < 0 || dto.graceOutMinutes < 0) {
      throw new BadRequestException('Grace minutes must be >= 0');
    }
    // start/end validity delegated to frontend but add sanity check
    const doc = await this.model.create(dto);
    return doc;
  }

  async findAll() {
    return this.model.find({}).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Shift not found');
    return doc;
  }

  async update(id: string, dto: UpdateShiftDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!doc) throw new NotFoundException('Shift not found');
    return doc;
  }
}
