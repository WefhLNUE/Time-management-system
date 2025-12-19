import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReportingService {
  constructor(
      @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
      @InjectModel('AttendanceRecord') private readonly attendanceModel: Model<any>,
  ) {}

  // =============================
  // Exceptions Summary
  // =============================
  async exceptionsSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);

    const breakdown = await this.exceptionModel.aggregate([
      { $match: q },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = breakdown.reduce((s, r) => s + r.count, 0);

    return {
      total,
      breakdown,
    };
  }

  // =============================
  // Overtime Summary (Payroll)
  // =============================
  async overtimeSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    return this.attendanceModel.aggregate([
      { $match: { ...q, overtimeMinutes: { $gt: 0 } } },
      {
        $group: {
          _id: '$employeeId',
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
        },
      },
    ]);
  }

  // =============================
  // Lateness Summary
  // =============================
  async latenessSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    return this.attendanceModel.aggregate([
      { $match: q },
      {
        $group: {
          _id: '$employeeId',
          lateCount: {
            $sum: { $cond: ['$isLate', 1, 0] },
          },
        },
      },
    ]);
  }

  // =============================
  // Dashboard KPIs
  // =============================
  async dashboardKpis() {
    const total = await this.exceptionModel.countDocuments();
    const approved = await this.exceptionModel.countDocuments({ status: 'APPROVED' });
    const rejected = await this.exceptionModel.countDocuments({ status: 'REJECTED' });
    const pending = await this.exceptionModel.countDocuments({ status: 'PENDING' });

    return {
      totalExceptions: total,
      approved,
      rejected,
      pending,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
    };
  }
}
