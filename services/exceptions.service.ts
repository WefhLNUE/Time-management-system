import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { UpdateExceptionStatusDto, TimeExceptionStatus } from '../dto/update-exception-status.dto';

@Injectable()
export class ExceptionsService {
  private readonly logger = new Logger(ExceptionsService.name);

  constructor(
    @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
    @InjectModel('NotificationLog') private readonly notificationModel: Model<any>,
  ) {}

  async createException(dto: CreateExceptionDto) {
    const now = new Date();
    const doc = await this.exceptionModel.create({
      employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : null,
      attendanceRecordId: dto.attendanceRecordId ? new Types.ObjectId(dto.attendanceRecordId) : null,
      type: dto.type,
      reason: dto.reason,
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : null,
      details: dto.details,
      createdAt: now,
      status: TimeExceptionStatus.OPEN,
    });

    await this.logNotification({
      employeeId: doc.employeeId,
      message: `Exception created (${doc._id})`,
      type: 'EXCEPTION_CREATED',
      createdAt: now,
    });

    // upon creation, move to PENDING if assignedTo present
    if (doc.assignedTo) {
      await this.updateStatus(doc._id.toString(), { status: TimeExceptionStatus.PENDING });
    }

    return doc;
  }

  async findAll(filter = {}, options = { limit: 50, skip: 0 }) {
    const q: any = {};
    if (filter['status']) q.status = filter['status'];
    if (filter['employeeId']) q.employeeId = filter['employeeId'];
    if (filter['assignedTo']) q.assignedTo = filter['assignedTo'];

    return this.exceptionModel.find(q).sort({ createdAt: -1 }).limit(options.limit).skip(options.skip).lean();
  }

  async findById(id: string) {
    return this.exceptionModel.findById(id).lean();
  }

  /**
   * Update status with lifecycle validation
   */
  async updateStatus(id: string, dto: UpdateExceptionStatusDto) {
    const doc = await this.exceptionModel.findById(id);
    if (!doc) throw new BadRequestException('Exception not found');

    const old = doc.status;
    const next = dto.status;

    // Validate allowed transitions
    const allowed = this.allowedTransition(old, next);
    if (!allowed) throw new BadRequestException(`Invalid status transition ${old} -> ${next}`);

    doc.status = next;
    if (dto.reviewerId) doc.reviewedBy = new Types.ObjectId(dto.reviewerId);
    if (dto.comment) doc.reviewComment = dto.comment;
    doc.updatedAt = new Date();

    await doc.save();

    await this.logNotification({
      employeeId: doc.employeeId,
      message: `Exception ${doc._id} status changed ${old} -> ${next}`,
      type: 'EXCEPTION_STATUS_CHANGED',
      createdAt: new Date(),
    });

    // If approved, optionally trigger integration (sync)
    if (next === TimeExceptionStatus.APPROVED) {
      // Integration will be triggered by IntegrationService; we'll emit a DB flag for now
      doc.synced = false;
      await doc.save();
    }

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
    const arr = transitions[from] || [];
    return arr.includes(to);
  }

  async logNotification(entry: { employeeId?: any; message: string; type?: string; createdAt?: Date }) {
    try {
      await this.notificationModel.create({
        employeeId: entry.employeeId,
        message: entry.message,
        type: entry.type || 'INFO',
        createdAt: entry.createdAt || new Date(),
      });
    } catch (e) {
      this.logger.warn('Failed to write notification log: ' + e.message);
    }
  }

  // Support auto-escalation: find overdue pending items
  async findPendingOverdue(cutoffDate: Date) {
    return this.exceptionModel.find({
      status: TimeExceptionStatus.PENDING,
      updatedAt: { $lte: cutoffDate },
    });
  }
}
