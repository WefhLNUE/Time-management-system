import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AttendanceService } from '../services/attendance.service';
import { PunchDto } from '../dto/punch.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

type AuthUser = {
  id: string;
  roles: string[];
  employeeNumber: string;
};

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  @Get('me')
  findMyAttendance(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.svc.findForEmployee(user.id);
  }

  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  @Post('punch')
  punch(@Req() req: Request, @Body() body: PunchDto) {
    const user = req.user as AuthUser;

    return this.svc.processPunch({
      ...body,
      employeeId: user.id, // enforce authenticated user
    });
  }
}
