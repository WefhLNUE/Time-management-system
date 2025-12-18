import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { NotificationService } from '../services/notification.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * 🔔 Notifications for logged-in user
   * req.user.id === EmployeeProfile._id
   */
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @Get()
  async getMyNotifications(@Req() req) {
    // IMPORTANT: this ID must match NotificationLog.to
    const employeeProfileId = req.user.id;

    return this.notificationService.findForEmployee(
      employeeProfileId.toString(),
    );
  }
}
