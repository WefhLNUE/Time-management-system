import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationLogDocument } from '../Models/notification-log.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('NotificationLog')
    private readonly model: Model<NotificationLogDocument>,
  ) {}

async createNotification(
  to: Types.ObjectId,
  message: string,
) {
  return this.model.create({
    to,
    type: 'SYSTEM',
    message,
  });
}


  async findForEmployee(employeeId: string) {
    return this.model
      .find({ to: employeeId })
      .sort({ createdAt: -1 })
      .lean();
  }
}
