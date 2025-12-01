import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// --------------------------
// Local Time-Management Models
// --------------------------
import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { NotificationService } from './notification.service';

// --------------------------
// IMPORTS FROM OTHER REPOS
// (Employee-Profile + Org-Structure)
// --------------------------
import { EmployeeProfile } from '../../employee-profile/Models/employee-profile.schema';
import { Department } from '../../organization-structure/Models/department.schema';
import { Position } from '../../organization-structure/Models/position.schema';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectModel('ShiftAssignment')
    private readonly model: Model<ShiftAssignmentDocument>,

    private readonly notificationSvc: NotificationService,

    // Employee + Org-Structure Models
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
  // Create Shift Assignment
  // ---------------------------------------
  async create(dto: CreateShiftAssignmentDto) {

    // -------------------------------
    // 1) Validate Employee (if provided)
    // -------------------------------
    if (dto.employeeId) {
      const employee = await this.employeeModel.findById(dto.employeeId);
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Overlap detection for employee
      const existing = await this.model.find({
        employeeId: dto.employeeId,
        status: { $in: ['PENDING', 'APPROVED'] },
      });

      for (const ex of existing) {
        if (this.overlaps(ex, dto.startDate, dto.endDate)) {
          throw new BadRequestException(
            'Overlapping assignment exists for employee',
          );
        }
      }
    }

    // -------------------------------
    // 2) Validate Department
    // -------------------------------
    if (dto.departmentId) {
      const dept = await this.deptModel.findById(dto.departmentId);
      if (!dept) throw new NotFoundException('Department not found');
    }

    // -------------------------------
    // 3) Validate Position
    // -------------------------------
    if (dto.positionId) {
      const pos = await this.positionModel.findById(dto.positionId);
      if (!pos) throw new NotFoundException('Position not found');
    }

    // -------------------------------
    // 4) Create the shift assignment
    // -------------------------------
    const doc = await this.model.create(dto);
    return doc;
  }

  // ---------------------------------------
  // Get all assignments
  // ---------------------------------------
  async findAll() {
    return this.model.find({}).lean();
  }

  // ---------------------------------------
  // Get assignments for an employee
  // ---------------------------------------
  async findForEmployee(employeeId: string) {
    return this.model
      .find({ employeeId, status: { $in: ['PENDING', 'APPROVED'] } })
      .lean();
  }

  // ---------------------------------------
  // Update assignment
  // ---------------------------------------
  async update(id: string, patch: any) {
    const doc = await this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('assignment not found');
    return doc;
  }

  // ---------------------------------------
  // Expire Assignment (Cron)
  // ---------------------------------------
  async expireAssignment(id: string) {
    const doc = await this.model.findByIdAndUpdate(
      id,
      { status: 'EXPIRED' },
      { new: true },
    );

    if (doc) {
      await this.notificationSvc.createNotification(
        null,
        `Shift assignment expired for ${
          doc.employeeId?.toString() || 'an employee'
        }`,
      );
    }

    return doc;
  }
}
