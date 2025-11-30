import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftService } from '../services/shift.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly svc: ShiftService) {}

  // Only HR Manager, HR Admin, System Admin can create shifts
  @Roles('HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.svc.create(dto);
  }

  // Everyone except employees? No — employees CAN view shift definitions.
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'EMPLOYEE', 'SYSTEM_ADMIN')
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // Everyone can view a single shift
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'EMPLOYEE', 'SYSTEM_ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // Update shift → Only HR Manager, HR Admin, System Admin
  @Roles('HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.svc.update(id, dto);
  }
}
