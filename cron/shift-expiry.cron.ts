import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { ShiftAssignmentService } from '../services/shift-assignment.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ShiftExpiryCron {
  private readonly logger = new Logger(ShiftExpiryCron.name);

  constructor(
      @InjectModel('ShiftAssignment')
      private readonly assignmentModel: Model<ShiftAssignmentDocument>,

      private readonly assignmentSvc: ShiftAssignmentService,
      private readonly notificationSvc: NotificationService,
  ) {}

  // 🔁 TEMP: every minute for testing
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running shift expiry check...');

    const now = new Date();

    const toExpire = await this.assignmentModel.find({
      endDate: { $lte: new Date() },
      status: { $in: ['PENDING', 'APPROVED'] },
    });


    for (const assignment of toExpire) {
      await this.assignmentSvc.expireAssignment(assignment._id.toString());

      // ✅ SAFETY CHECK
      if (!assignment.employeeId) continue;

      // 🔔 CREATE NOTIFICATION
      await this.notificationSvc.createNotification(
          assignment.employeeId,
          `Your shift assignment expired on ${assignment.endDate?.toDateString()}`,
      );
    }

    this.logger.log(`Expired ${toExpire.length} assignments`);
  }
}
