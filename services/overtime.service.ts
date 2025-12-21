import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeExceptionType } from '../Models/enums/index';
import { ExceptionsService } from './exceptions.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
@Injectable()
export class OvertimeService {
  constructor(
    @InjectModel('AttendanceRecord') private readonly attendance: Model<any>,
    @InjectModel('OvertimeRule') private readonly overtimeRule: Model<any>,
    private readonly exceptionsSvc: ExceptionsService
  ) {}

async createRequest(dto) {
  // 1️⃣ Ensure active overtime rule exists
  const rule = await this.overtimeRule.findOne({ active: true });
  if (!rule) {
    throw new BadRequestException('No active overtime rule configured');
  }

  // 2️⃣ Validate attendance record
  const rec = await this.attendance.findById(dto.attendanceRecordId);
  if (!rec) {
    throw new NotFoundException('Attendance record not found');
  }

  // 3️⃣ Mark payroll as unfinalized
  rec.finalisedForPayroll = false;
  await rec.save();

  return {
    requestId: rec._id,
    message: 'Your overtime request is submitted and awaiting manager approval',
  };
}

  async review(id, dto) {
    if (dto.status === 'APPROVED') {
      await this.exceptionsSvc.createException({
        employeeId: dto.employeeId,
        attendanceRecordId: dto.attendanceRecordId,
        type: TimeExceptionType.OVERTIME_REQUEST,
        reason: 'Approved overtime'
      });
    }

    return { updated: true };
  }
}
