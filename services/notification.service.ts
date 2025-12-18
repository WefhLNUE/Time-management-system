// src/time-management/services/notification.service.ts
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
      to: Types.ObjectId | null,
      message: string,
  ) {
    return this.model.create({
      to,
      type: 'SYSTEM',
      message,
    });
  }

  async getMyNotifications(user: { id: string }) {
    return this.model
        .find({
          $or: [
            { to: null }, // system-wide
            { to: new Types.ObjectId(user.id) }, // personal
          ],
        })
        .sort({ createdAt: -1 })
        .lean();
  }
}
