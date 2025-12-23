import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import {
  UpdateExceptionStatusDto,
  TimeExceptionStatus,
} from '../dto/update-exception-status.dto';
import { AttendanceRecord } from '../Models/attendance-record.schema';
import { LatenessRule } from '../Models/lateness-rule.schema';
import { TimeExceptionType } from '../Models/enums';

@Injectable()
export class ExceptionsService {
  private readonly logger = new Logger(ExceptionsService.name);

  constructor(
  @InjectModel('TimeException')
  private readonly exceptionModel: Model<any>,

  @InjectModel('NotificationLog')
  private readonly notificationModel: Model<any>,

  @InjectModel(AttendanceRecord.name)
  private readonly attendanceModel: Model<AttendanceRecord>,

  @InjectModel(LatenessRule.name)
  private readonly latenessRuleModel: Model<LatenessRule>,
) {}


  async createException(dto: CreateExceptionDto) {
    if (!dto.employeeId) {
      throw new BadRequestException('employeeId is required');
    }

    const now = new Date();
    const employeeObjectId = new Types.ObjectId(dto.employeeId);

    const assignedTo = dto.assignedTo
        ? new Types.ObjectId(dto.assignedTo)
        : employeeObjectId;

    const attendanceRecordId = dto.attendanceRecordId
        ? new Types.ObjectId(dto.attendanceRecordId)
        : employeeObjectId;

    const doc = await this.exceptionModel.create({
      employeeId: employeeObjectId,
      attendanceRecordId,
      assignedTo,
      type: dto.type ?? 'MANUAL_ADJUSTMENT',
      reason: dto.reason,
      status: TimeExceptionStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    });

    await this.logNotification({
      employeeId: doc.employeeId,
      message: `Exception created (${doc._id})`,
      type: 'EXCEPTION_CREATED',
      createdAt: now,
    });

    if (dto.assignedTo) {
      await this.updateStatus(doc._id.toString(), {
        status: TimeExceptionStatus.PENDING,
      });
    }

    return doc;
  }

  async findAll(filter = {}, options = { limit: 50, skip: 0 }) {
    const q: any = {};
    if (filter['status']) q.status = filter['status'];
    if (filter['employeeId']) q.employeeId = filter['employeeId'];
    if (filter['assignedTo']) q.assignedTo = filter['assignedTo'];

    return this.exceptionModel
        .find(q)
        .sort({ createdAt: -1 })
        .limit(options.limit)
        .skip(options.skip)
        .lean();
  }

  async findById(id: string) {
    return this.exceptionModel.findById(id).lean();
  }

async updateStatus(id: string, dto: UpdateExceptionStatusDto) {
  const doc = await this.exceptionModel.findById(id);
  if (!doc) throw new BadRequestException('Exception not found');

  const oldStatus = doc.status;
  const nextStatus = dto.status;

  if (!this.allowedTransition(oldStatus, nextStatus)) {
    throw new BadRequestException(
      `Invalid status transition ${oldStatus} -> ${nextStatus}`,
    );
  }

  doc.status = nextStatus;
  doc.updatedAt = new Date();

  if (dto.reviewerId) {
    doc.reviewedBy = new Types.ObjectId(dto.reviewerId);
  }

  if (dto.comment) {
    doc.reviewComment = dto.comment;
  }

  await doc.save();

  // =====================================================
  // 🔥 APPLY LATENESS DEDUCTION ON APPROVAL (NO SCHEMA CHANGE)
  // =====================================================
  if (
    oldStatus !== TimeExceptionStatus.APPROVED &&
    nextStatus === TimeExceptionStatus.APPROVED &&
    doc.type === TimeExceptionType.LATE
  ) {
    const attendance = await this.attendanceModel.findById(
      doc.attendanceRecordId,
    );

    if (attendance) {
      const rule = await this.latenessRuleModel.findOne({ active: true });

      if (rule && doc.reason) {
        // Extract lateness minutes from "Late by X minutes"
        const match = doc.reason.match(/(\d+)/);
        const lateMinutes = match ? Number(match[1]) : 0;

        const penalty =
          lateMinutes * (rule.deductionForEachMinute ?? 0);

        attendance.totalWorkMinutes = Math.max(
          0,
          attendance.totalWorkMinutes - penalty,
        );

        attendance.finalisedForPayroll = false;

        if (!attendance.exceptionIds) {
          attendance.exceptionIds = [];
        }

        attendance.exceptionIds.push(doc._id);

        await attendance.save();
      }
    }
  }

  await this.logNotification({
    employeeId: doc.employeeId,
    message: `Exception ${doc._id} status changed ${oldStatus} → ${nextStatus}`,
    type: 'EXCEPTION_STATUS_CHANGED',
    createdAt: new Date(),
  });

  return doc.toObject();
}


  private allowedTransition(from: string, to: string): boolean {
    const transitions: Record<string, string[]> = {
      OPEN: ['PENDING', 'REJECTED'],
      PENDING: ['APPROVED', 'REJECTED', 'ESCALATED'],
      ESCALATED: ['APPROVED', 'REJECTED'],
      APPROVED: ['RESOLVED'],
      REJECTED: [],
      RESOLVED: [],
    };

    return transitions[from]?.includes(to) ?? false;
  }

  // 🔴 REQUIRED BY REQUIREMENT #18
  async escalatePendingBeforeCutoff(cutoffDate: Date) {
    const overdue = await this.exceptionModel.find({
      status: TimeExceptionStatus.PENDING,
      updatedAt: { $lte: cutoffDate },
    });

    for (const ex of overdue) {
      ex.status = TimeExceptionStatus.ESCALATED;
      ex.updatedAt = new Date();
      await ex.save();

      await this.logNotification({
        employeeId: ex.employeeId,
        message: `Exception ${ex._id} escalated before payroll cut-off`,
        type: 'EXCEPTION_ESCALATED',
      });
    }

    if (overdue.length) {
      this.logger.warn(
          `Escalated ${overdue.length} exception(s) before payroll cut-off`,
      );
    }
  }

  async logNotification(entry: {
    employeeId?: any;
    message: string;
    type?: string;
    createdAt?: Date;
  }) {
    try {
      await this.notificationModel.create({
        employeeId: entry.employeeId,
        message: entry.message,
        type: entry.type || 'INFO',
        createdAt: entry.createdAt || new Date(),
      });
    } catch (e) {
      this.logger.warn(
          'Failed to write notification log: ' + e.message,
      );
    }
  }
}
