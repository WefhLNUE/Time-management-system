import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShiftAssignmentService } from '../services/shift-assignment.service';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shift-assignments')
export class ShiftAssignmentController {
  constructor(private readonly svc: ShiftAssignmentService) {}

  // Create shift assignment → HR Manager, HR Admin, Line Manager
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'SYSTEM_ADMIN')
  @Post()
  create(@Body() dto: CreateShiftAssignmentDto) {
    return this.svc.create(dto);
  }

  // View all assignments → HR Admin, HR Manager, System Admin
  @Roles('HR_ADMIN', 'HR_MANAGER', 'SYSTEM_ADMIN')
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // Employee can view their own + HR / Managers can view any
  @Roles('EMPLOYEE', 'LINE_MANAGER', 'HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Get('employee/:employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  // Update assignment → HR Admin, HR Manager, System Admin
  @Roles('HR_ADMIN', 'HR_MANAGER', 'SYSTEM_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }
}
