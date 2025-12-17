import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { NotificationService } from './notification.service';

import { EmployeeProfile } from '../../employee-profile/Models/employee-profile.schema';
import { Department } from '../../organization-structure/Models/department.schema';
import { Position } from '../../organization-structure/Models/position.schema';
import { ShiftAssignmentStatus } from '../Models/enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectModel('ShiftAssignment')
    private readonly model: Model<ShiftAssignmentDocument>,

    private readonly notificationSvc: NotificationService,

    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<any>,

    @InjectModel(Department.name)
    private readonly deptModel: Model<any>,

    @InjectModel(Position.name)
    private readonly positionModel: Model<any>,
  ) {}

  // ---------------------------------------
  // Helper: detect overlapping assignments
  // ---------------------------------------
  private overlaps(existing, startDate, endDate) {
    const s = new Date(startDate).getTime();
    const e = endDate ? new Date(endDate).getTime() : Infinity;
    const es = new Date(existing.startDate).getTime();
    const ee = existing.endDate ? new Date(existing.endDate).getTime() : Infinity;
    return !(e < es || s > ee);
  }

  // ---------------------------------------
  // Create Assignment
  // ---------------------------------------
  async create(dto: CreateShiftAssignmentDto) {
    if (dto.employeeId) {
      const employee = await this.employeeModel.findById(dto.employeeId);
      if (!employee) throw new NotFoundException('Employee not found');

      const existing = await this.model.find({
        employeeId: dto.employeeId,
        status: { $in: [ShiftAssignmentStatus.PENDING, ShiftAssignmentStatus.APPROVED] },
      });

      for (const ex of existing) {
        if (this.overlaps(ex, dto.startDate, dto.endDate)) {
          throw new BadRequestException(
            'Overlapping assignment exists for employee',
          );
        }
      }
    }

    if (dto.departmentId) {
      const dept = await this.deptModel.findById(dto.departmentId);
      if (!dept) throw new NotFoundException('Department not found');
    }

    if (dto.positionId) {
      const pos = await this.positionModel.findById(dto.positionId);
      if (!pos) throw new NotFoundException('Position not found');
    }

    return this.model.create(dto);
  }

  // ---------------------------------------
  // Queries
  // ---------------------------------------
  async findAll() {
    return this.model.find({}).lean();
  }

  async findForEmployee(employeeId: string) {
    return this.model.find({ employeeId }).lean();
  }

  async findOne(id: string) {
    const doc = await this.model
      .findById(id)
      .populate(['shiftId', 'scheduleRuleId'])
      .lean();

    if (!doc) throw new NotFoundException('Assignment not found');
    return doc;
  }

  // ---------------------------------------
// Cron: Expire approved assignments
// ---------------------------------------
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async expireAssignment() {
  const now = new Date();

  const expiredAssignments = await this.model.find({
    status: ShiftAssignmentStatus.APPROVED,
    endDate: { $lt: now },
  });

  for (const assignment of expiredAssignments) {
    assignment.status = ShiftAssignmentStatus.EXPIRED;
    await assignment.save();

    if (assignment.employeeId) {
      await this.notificationSvc.createNotification(
        assignment.employeeId,
        'Your shift assignment has expired.',
      );
    }
  }
}

  // ---------------------------------------
  // Update (ONLY PENDING)
  // ---------------------------------------
  async update(id: string, patch: any) {
    const existing = await this.model.findById(id);
    if (!existing) throw new NotFoundException('Assignment not found');

    if (existing.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be edited',
      );
    }

    return this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean();
  }

  // ===============================
  // ✅ APPROVAL LOGIC
  // ===============================

  async approve(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Assignment not found');

    if (doc.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be approved',
      );
    }

    doc.status = ShiftAssignmentStatus.APPROVED;
    await doc.save();

    if (doc.employeeId) {
      await this.notificationSvc.createNotification(
        doc.employeeId,
        'Your shift assignment has been approved.',
      );
    }

    return doc;
  }

  async reject(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Assignment not found');

    if (doc.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be cancelled',
      );
    }

    doc.status = ShiftAssignmentStatus.CANCELLED;
    await doc.save();

    if (doc.employeeId) {
      await this.notificationSvc.createNotification(
        doc.employeeId,
        'Your shift assignment has been cancelled.',
      );
    }

    return doc;
  }
}
