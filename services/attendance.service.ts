import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AttendanceRecord } from '../Models/attendance-record.schema';
import { TimeExceptionType } from '../Models/enums';
import { ExceptionsService } from './exceptions.service';
import { PunchDto } from '../dto/punch.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectModel('AttendanceRecord')
        private readonly attendance: Model<AttendanceRecord>,
        private readonly exceptionsSvc: ExceptionsService,
    ) {}

    async findForEmployee(employeeId: string) {
        return this.attendance
            .find({ employeeId })
            .sort({ _id: -1 })
            .lean();
    }

    async processPunch(dto: PunchDto) {
        const { employeeId, punchType, time } = dto;
        const timestamp = new Date(time);

        // 🔥 Find last attendance record
        let record = await this.attendance
            .findOne({ employeeId })
            .sort({ _id: -1 });

        // 🔥 Decide whether to reuse or create
        if (
            !record ||
            record.punches.length % 2 === 0 // closed record
        ) {
            record = await this.attendance.create({
                employeeId,
                punches: [],
                totalWorkMinutes: 0,
                hasMissedPunch: false,
                finalisedForPayroll: false,
            });
        }

        // Add punch
        record.punches.push({ type: punchType, time: timestamp });

        // Validate full sequence
        const isValid = this.validateSequence(record.punches);

        if (!isValid) {
            record.hasMissedPunch = true;

            await this.exceptionsSvc.createException({
                employeeId,
                attendanceRecordId: record._id.toString(),
                type: TimeExceptionType.MISSED_PUNCH,
                reason: 'Invalid IN/OUT sequence',
                assignedTo: employeeId,
            });

            await record.save();
            return record;
        }

        // Sequence valid
        record.hasMissedPunch = false;

        // Compute minutes if possible
        if (record.punches.length >= 2) {
            const firstIn = record.punches[0].time;
            const lastOut = record.punches[record.punches.length - 1].time;

            record.totalWorkMinutes = Math.floor(
                (lastOut.getTime() - firstIn.getTime()) / 60000,
            );
        }

        await record.save();
        return record;
    }

    validateSequence(punches: { type: string }[]) {
        let expected = 'IN';

        for (const p of punches) {
            if (p.type !== expected) return false;
            expected = expected === 'IN' ? 'OUT' : 'IN';
        }

        return true;
    }
}
