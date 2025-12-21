import {
  Controller,
  Post,
  Param,
  Get,
  Body,
  UseGuards,
  Req,
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

  // ✅ EMPLOYEE + HR + SYSTEM ADMIN can view own attendance
  @Roles(
      SystemRole.DEPARTMENT_EMPLOYEE,
      SystemRole.HR_ADMIN,
      SystemRole.SYSTEM_ADMIN
  )
  @Get('me')
  findMyAttendance(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.svc.findForEmployee(user.id);
  }

  // ✅ HR / SYSTEM ADMIN view any employee
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Get(':employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  // ✅ EMPLOYEE + HR + SYSTEM ADMIN can punch
  @Roles(
      SystemRole.DEPARTMENT_EMPLOYEE,
      SystemRole.HR_ADMIN,
      SystemRole.SYSTEM_ADMIN
  )
  @Post('punch')
  punch(@Req() req: Request, @Body() body: PunchDto) {
    const user = req.user as AuthUser;

    return this.svc.processPunch({
      ...body,
      employeeId: user.id,
    });
  }
}
