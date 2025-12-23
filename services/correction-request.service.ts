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
import { CorrectionRequestStatus } from '../Models/enums';

@Injectable()
export class CorrectionRequestService {
  constructor(
    @InjectModel(AttendanceCorrectionRequest.name)
    private readonly correctionModel: Model<AttendanceCorrectionRequest>,

    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecord>,
  ) {}

  // =========================
  // CREATE (EMPLOYEE)
  // =========================
  async create(dto: CorrectionRequestDto) {
    const attendance = await this.attendanceModel.findById(
      dto.attendanceRecordId,
    );

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (attendance.employeeId.toString() !== dto.employeeId) {
      throw new BadRequestException(
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
      status: {
        $in: [
          CorrectionRequestStatus.SUBMITTED,
          CorrectionRequestStatus.IN_REVIEW,
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A correction request already exists for this attendance record',
      );
    }

    const request = await this.correctionModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      attendanceRecord: new Types.ObjectId(dto.attendanceRecordId),
      reason: dto.reason,
      status: CorrectionRequestStatus.SUBMITTED,
    });

    // Payroll must remain open until reviewed
    attendance.finalisedForPayroll = false;
    await attendance.save();

    return request;
  }

  // =========================
  // FIND ALL (HR / MANAGER)
  // =========================
  async findAll() {
    return this.correctionModel.find().lean().exec();
  }

  // =========================
  // REVIEW (APPROVE / REJECT)
  // =========================
  async reviewRequest(id: string, dto: any) {
    const request = await this.correctionModel.findById(id);

    if (!request) {
      throw new NotFoundException('Correction request not found');
    }

    if (request.status !== CorrectionRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only submitted requests can be reviewed',
      );
    }

    if (
      ![
        CorrectionRequestStatus.APPROVED,
        CorrectionRequestStatus.REJECTED,
      ].includes(dto.status)
    ) {
      throw new BadRequestException('Invalid review status');
    }

    request.status = dto.status;
    await request.save();

    // If approved, fix attendance
    if (dto.status === CorrectionRequestStatus.APPROVED) {
      const attendance = await this.attendanceModel.findById(
        request.attendanceRecord,
      );

      if (attendance) {
        attendance.hasMissedPunch = false;
        attendance.finalisedForPayroll = true;
        await attendance.save();
      }
    }

    return request;
  }
}
