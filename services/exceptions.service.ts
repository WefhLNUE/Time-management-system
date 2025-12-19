import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import {
  UpdateExceptionStatusDto,
  TimeExceptionStatus,
} from '../dto/update-exception-status.dto';

@Injectable()
export class ExceptionsService {
  private readonly logger = new Logger(ExceptionsService.name);

  constructor(
      @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
      @InjectModel('NotificationLog') private readonly notificationModel: Model<any>,
  ) {}

  async createException(dto: CreateExceptionDto) {
    if (!dto.employeeId) {
      throw new BadRequestException('employeeId is required');
    }

    const now = new Date();
    const employeeObjectId = new Types.ObjectId(dto.employeeId);

    // Required by schema (placeholders, replaced later)
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
      type: 'MANUAL_ADJUSTMENT', // ✅ VALID ENUM VALUE
      reason: dto.reason,
      status: TimeExceptionStatus.OPEN,
      createdAt: now,
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

    await this.logNotification({
      employeeId: doc.employeeId,
      message: `Exception ${doc._id} status changed ${oldStatus} -> ${nextStatus}`,
      type: 'EXCEPTION_STATUS_CHANGED',
      createdAt: new Date(),
    });

    return doc.toObject();
  }

  private allowedTransition(from: string, to: string): boolean {
    const transitions = {
      OPEN: ['PENDING', 'REJECTED'],
      PENDING: ['APPROVED', 'REJECTED', 'OPEN'],
      APPROVED: ['RESOLVED'],
      REJECTED: [],
      RESOLVED: [],
    };

    return transitions[from]?.includes(to) ?? false;
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

  async findPendingOverdue(cutoffDate: Date) {
    return this.exceptionModel.find({
      status: TimeExceptionStatus.PENDING,
      updatedAt: { $lte: cutoffDate },
    });
  }
}
