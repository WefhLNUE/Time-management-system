import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AttendanceCorrectionRequest } from '../Models/attendance-correction-request.schema';
import { AttendanceRecord } from '../Models/attendance-record.schema';
import { CorrectionRequestDto } from '../dto/correction-request.dto';

@Injectable()
export class CorrectionRequestService {
    constructor(
        @InjectModel(AttendanceCorrectionRequest.name)
        private readonly correctionModel: Model<AttendanceCorrectionRequest>,

        @InjectModel(AttendanceRecord.name)
        private readonly attendanceModel: Model<AttendanceRecord>,
    ) {}

    async create(dto: CorrectionRequestDto) {
        const attendance = await this.attendanceModel.findById(
            dto.attendanceRecordId,
        );

        if (!attendance) {
            throw new NotFoundException('Attendance record not found');
        }

        if (attendance.employeeId.toString() !== dto.employeeId) {
            throw new NotFoundException(
                'Attendance record does not belong to employee',
            );
        }

        if (!attendance.hasMissedPunch) {
            throw new BadRequestException(
                'Correction request allowed only for missed punches',
            );
        }

        const existing = await this.correctionModel.findOne({
            attendanceRecord: dto.attendanceRecordId,
            status: { $in: ['SUBMITTED', 'IN_REVIEW'] },
        });

        if (existing) {
            throw new BadRequestException(
                'A correction request already exists for this attendance record',
            );
        }

        const request = await this.correctionModel.create({
            employeeId: new Types.ObjectId(dto.employeeId),

            // ✅ CORRECT FIELD NAME
            attendanceRecord: new Types.ObjectId(dto.attendanceRecordId),

            reason: dto.reason,

            // ✅ CORRECT ENUM VALUE
            status: 'SUBMITTED',
        });

        return request;
    }
}
