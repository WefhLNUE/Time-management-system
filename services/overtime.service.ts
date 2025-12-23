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
  if (!dto.attendanceRecordId) {
    throw new BadRequestException('attendanceRecordId is required');
  }

  const rule = await this.overtimeRule.findOne({ active: true });
  if (!rule) {
    throw new BadRequestException('No active overtime rule');
  }

  const rec = await this.attendance.findById(dto.attendanceRecordId);
  if (!rec) {
    throw new BadRequestException('Attendance record not found');
  }

  // Optional but correct
  if (rec.finalisedForPayroll) {
    throw new BadRequestException('Attendance already finalised');
  }

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
