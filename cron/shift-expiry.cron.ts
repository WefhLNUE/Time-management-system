import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { Model } from 'mongoose';
import { ShiftAssignmentService } from '../services/shift-assignment.service';

@Injectable()
export class ShiftExpiryCron {
  private readonly logger = new Logger(ShiftExpiryCron.name);

  constructor(
    @InjectModel('ShiftAssignment') private readonly assignmentModel: Model<ShiftAssignmentDocument>,
    private readonly assignmentSvc: ShiftAssignmentService,
  ) {}

  // runs daily at 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running shift expiry check...');
    const now = new Date();
    const toExpire = await this.assignmentModel.find({
      endDate: { $lte: now },
      status: { $in: ['PENDING','APPROVED'] },
    }).lean();

    for (const a of toExpire) {
      await this.assignmentSvc.expireAssignment(a._id.toString());

    }
    this.logger.log(`Expired ${toExpire.length} assignments`);
  }
}
