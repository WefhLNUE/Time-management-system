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
        console.log('🔥 PunchesService.getAllPunches() CALLED');

        // ❗ DO NOT filter in Mongo — your data proves this breaks
        const records = await this.attendanceModel
            .find()
            .populate('employeeId', 'employeeNumber workEmail')
            .exec();

        console.log('📦 Attendance records found:', records.length);

        const punches: PunchAudit[] = [];

        for (const record of records) {
            if (!record.punches || record.punches.length === 0) continue;

            for (const punch of record.punches) {
                punches.push({
                    employeeId: record.employeeId,
                    time: punch.time,
                    type: punch.type,
                    source: 'MANUAL',
                });
            }
        }

        console.log('📊 Total punches returned:', punches.length);

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
