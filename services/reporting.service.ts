import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReportingService {
  constructor(
    @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
    @InjectModel('AttendanceRecord') private readonly attendanceModel: Model<any>,
    @InjectModel('OvertimeRule') private readonly overtimeRuleModel: Model<any>,
  ) {}

  async exceptionsSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
    const total = await this.exceptionModel.countDocuments(q);
    const byStatus = await this.exceptionModel.aggregate([
      { $match: q },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return { total, byStatus };
  }

  async overtimeSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    // This assumes attendance records contain overtime minutes/hours fields.
    const pipeline = [
      { $match: q },
      {
        $group: {
          _id: '$employeeId',
          totalOvertime: { $sum: '$overtimeMinutes' },
        },
      },
      { $limit: 1000 },
    ];
    const rows = await this.attendanceModel.aggregate(pipeline);
    return rows;
  }

  async latenessSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    const pipeline = [
      { $match: q },
      {
        $group: {
          _id: '$employeeId',
          lateCount: { $sum: { $cond: ['$isLate', 1, 0] } },
        },
      },
    ];
    const rows = await this.attendanceModel.aggregate(pipeline);
    return rows;
  }

  async dashboardKpis(period?: string) {
    // simple KPIs
    const exceptions = await this.exceptionModel.countDocuments();
    const approved = await this.exceptionModel.countDocuments({ status: 'APPROVED' });
    const rejected = await this.exceptionModel.countDocuments({ status: 'REJECTED' });
    return { exceptions, approved, rejected };
  }
}
