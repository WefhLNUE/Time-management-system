import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CorrectionService {
  constructor(
    @InjectModel('AttendanceCorrectionRequest') private readonly correction: Model<any>,
    @InjectModel('AttendanceRecord') private readonly attendance: Model<any>
  ) {}

  async createRequest(dto) {
    const req = await this.correction.create(dto);

    const rec = await this.attendance.findById(dto.attendanceRecordId);
    rec.finalisedForPayroll = false;
    await rec.save();

    return req;
  }

  async reviewRequest(id, dto) {
    const req = await this.correction.findById(id);

    req.status = dto.status;
    req.managerComment = dto.managerComment || null;
    await req.save();

    const rec = await this.attendance.findById(req.attendanceRecordId);

    if (dto.status === 'APPROVED') {
      rec.hasMissedPunch = false;
      rec.finalisedForPayroll = true;
    }

    await rec.save();

    return req;
  }
}
