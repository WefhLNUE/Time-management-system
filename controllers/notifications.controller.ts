import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { NotificationService } from '../services/notification.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationService: NotificationService) {}

    @Roles(
        SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN,
    )
    @Get()
    async getMyNotifications(@Req() req) {
        return this.notificationService.getMyNotifications(req.user);
    }
}
