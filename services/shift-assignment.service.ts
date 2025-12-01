import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { NotificationService } from './notification.service';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectModel('ShiftAssignment') private readonly model: Model<ShiftAssignmentDocument>,
    private readonly notificationSvc: NotificationService,
  ) {}

  // helper to detect overlap for same employee
  private overlaps(existing, startDate, endDate) {
    const s = new Date(startDate).getTime();
    const e = endDate ? new Date(endDate).getTime() : Infinity;
    const es = new Date(existing.startDate).getTime();
    const ee = existing.endDate ? new Date(existing.endDate).getTime() : Infinity;
    return !(e < es || s > ee);
  }

  async create(dto: CreateShiftAssignmentDto) {
    // If assigning to employee -> check overlaps
    if (dto.employeeId) {
      const existing = await this.model.find({ employeeId: dto.employeeId, status: { $in: ['PENDING','APPROVED'] }});
      for (const ex of existing) {
        if (this.overlaps(ex, dto.startDate, dto.endDate)) {
          throw new BadRequestException('Overlapping assignment exists for employee');
        }
      }
    }

    const doc = await this.model.create(dto);
    return doc;
  }

  async findAll() {
    return this.model.find({}).lean();
  }

  async findForEmployee(employeeId: string) {
    return this.model.find({ employeeId, status: { $in: ['PENDING','APPROVED'] } }).lean();
  }

  async update(id: string, patch: any) {
    const doc = await this.model.findByIdAndUpdate(id, patch, { new: true }).lean();
    if (!doc) throw new NotFoundException('assignment not found');
    return doc;
  }

  // called by cron to expire old assignments
  async expireAssignment(id: string) {
    const doc = await this.model.findByIdAndUpdate(id, { status: 'EXPIRED' }, { new: true });
    if (doc) {
      await this.notificationSvc.createNotification(
        null,
        `Shift assignment expired for ${doc.employeeId?.toString() || 'an employee'}`
      );
    }
    return doc;
  }
}
