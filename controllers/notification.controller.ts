import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { NotificationLogDocument } from '../Models/notification-log.schema';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    @InjectModel('NotificationLog')
    private readonly model: Model<NotificationLogDocument>,
  ) {}

  // 🔔 Get notifications for logged-in user
    @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.SYSTEM_ADMIN,
    )
  @Get()
  async getMyNotifications(@Req() req) {
    const userId = req.user.id;

    return this.model
      .find({ to: userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}
