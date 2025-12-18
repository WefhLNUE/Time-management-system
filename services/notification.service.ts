import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationLogDocument } from '../Models/notification-log.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('NotificationLog')
    private readonly model: Model<NotificationLogDocument>,
  ) {}

  async createNotification(to: Types.ObjectId | string, message: string) {
    return this.model.create({
      to: new Types.ObjectId(to), // 🔥 FORCE ObjectId
      type: 'SYSTEM',
      message,
    });
  }

  async findForEmployee(employeeId: string) {
    return this.model
      .find({ to: new Types.ObjectId(employeeId) }) // 🔥 MATCH ObjectId
      .sort({ createdAt: -1 })
      .lean();
  }
}
