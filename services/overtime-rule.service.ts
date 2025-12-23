import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimeRule } from '../Models/overtime-rule.schema';
import { CreateOvertimeRuleDto } from '../dto/create-overtime-rule.dto';
import { UpdateOvertimeRuleDto } from '../dto/update-overtime-rule.dto';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class OvertimeRuleService {
  constructor(
    @InjectModel(OvertimeRule.name)
    private readonly overtimeRuleModel: Model<OvertimeRule>,
  ) {}

  async create(dto: CreateOvertimeRuleDto) {
  // Check if an active rule already exists
  const existing = await this.overtimeRuleModel.findOne({ active: true });
  if (existing) {
    throw new BadRequestException(
      'An active overtime rule already exists. Deactivate it first.'
    );
  }

  return this.overtimeRuleModel.create(dto);
}

  findAll() {
    return this.overtimeRuleModel.find();
  }

  async findOne(id: string) {
    const rule = await this.overtimeRuleModel.findById(id);
    if (!rule) throw new NotFoundException('Overtime rule not found');
    return rule;
  }

  async update(id: string, dto: UpdateOvertimeRuleDto) {
  const rule = await this.overtimeRuleModel.findById(id);
  if (!rule) {
    throw new NotFoundException('Overtime rule not found');
  }

  // ✅ If activating this rule, deactivate all others
  if (dto.active === true) {
    await this.overtimeRuleModel.updateMany(
      { _id: { $ne: id } },
      { $set: { active: false } },
    );
  }

  Object.assign(rule, dto);
  await rule.save();

  return rule;
}


  async delete(id: string) {
    const deleted = await this.overtimeRuleModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Overtime rule not found');
    return deleted;
  }
}
