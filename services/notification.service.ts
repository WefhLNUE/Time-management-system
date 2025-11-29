import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationLogDocument } from '../Models/notification-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(@InjectModel('NotificationLog') private readonly model: Model<NotificationLogDocument>) {}

  async createNotification(to: string | null, message: string) {
    return this.model.create({ to: to ? to : null, type: 'SYSTEM', message });
  }
}
