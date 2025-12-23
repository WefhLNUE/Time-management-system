import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AttendanceRecord } from '../Models/attendance-record.schema';
import { AttendanceService } from './attendance.service';
import { PunchType } from '../Models/enums';

type PunchAudit = {
    employeeId: Types.ObjectId | {
        employeeNumber?: string;
        workEmail?: string;
    };
    time: Date;
    type: PunchType;
    source: string;
};

@Injectable()
export class PunchesService {
    constructor(
        @InjectModel(AttendanceRecord.name)
        private readonly attendanceModel: Model<AttendanceRecord>,
        private readonly attendanceSvc: AttendanceService,
    ) {}

    async getAllPunches(): Promise<PunchAudit[]> {
  const records = await this.attendanceModel
    .find({ 'punches.0': { $exists: true } }) // ✅ ONLY records with punches
    .populate('employeeId', 'employeeNumber workEmail')
    .lean()
    .exec();

  const punches: PunchAudit[] = [];

  for (const record of records) {
    for (const punch of record.punches) {
      punches.push({
        employeeId: record.employeeId,
        time: punch.time,
        type: punch.type,
        source: 'MANUAL',
      });
    }
  }

  return punches.sort(
    (a, b) => b.time.getTime() - a.time.getTime(),
  );
}


    async createManualPunch(payload: {
        employeeId: string;
        timestamp: string;
        type?: 'IN' | 'OUT';
    }) {
        return this.attendanceSvc.processPunch({
            employeeId: payload.employeeId,
            punchType:
                payload.type === 'OUT'
                    ? PunchType.OUT
                    : PunchType.IN,
            time: payload.timestamp,
        });
    }
}
