import {
    Body,
    Controller,
    Post,
    Patch,
    Param,
    Get,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { CorrectionRequestDto } from '../dto/correction-request.dto';
import { CorrectionRequestService } from '../services/correction-request.service';

type AuthUser = {
    id: string;
    roles: string[];
    employeeNumber: string;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/correction-request')
export class CorrectionRequestController {
  constructor(private readonly svc: CorrectionRequestService) {}

  // =====================
  // CREATE (EMPLOYEE)
  // =====================
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  @Post()
  async create(@Body() dto: CorrectionRequestDto, @Req() req: Request) {
    const user = req.user as AuthUser;

    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      dto.employeeId !== user.id
    ) {
      throw new ForbiddenException('Employee mismatch');
    }

    return this.svc.create(dto);
  }

  // =====================
  // REVIEW (MANAGER / HR)
  // =====================
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
  )
  @Patch(':id')
  review(@Param('id') id: string, @Body() dto: any) {
    return this.svc.reviewRequest(id, dto);
  }
}
