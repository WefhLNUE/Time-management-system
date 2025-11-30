import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ScheduleRuleService } from '../services/schedule-rule.service';
import { CreateScheduleRuleDto } from '../dto/create-schedule-rule.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedule-rules')
export class ScheduleRuleController {
  constructor(private readonly svc: ScheduleRuleService) {}

  // Only HR Manager, HR Admin, System Admin can create schedule rules
  @Roles('HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  create(@Body() dto: CreateScheduleRuleDto) {
    return this.svc.create(dto);
  }

  // HR, Managers, Admins can view schedule rules
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'SYSTEM_ADMIN')
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // Only HR Manager, HR Admin, System Admin can update
  @Roles('HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Patch(':id')
  update() {
    // implement as needed
  }
}
