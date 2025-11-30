import { Controller, Post, Body, Get, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { HolidaysService } from '../services/holidays.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/holidays')
export class HolidaysController {
  constructor(private readonly svc: HolidaysService) {}

  // Only HR Admin + System Admin can create holidays
  @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  create(@Body() dto: CreateHolidayDto) {
    return this.svc.createHoliday(dto);
  }

  // All employees, managers, HR, admins can view holiday calendar
  @Roles('EMPLOYEE', 'LINE_MANAGER', 'HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Get()
  list() {
    return this.svc.findAll();
  }

  // Everyone can view a single holiday
  @Roles('EMPLOYEE', 'LINE_MANAGER', 'HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Get(':id')
  async get(@Param('id') id: string) {
    const h = await this.svc.findById(id);
    if (!h) throw new NotFoundException('Holiday not found');
    return h;
  }

  // Only HR Admin + System Admin can update holidays
  @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.svc.update(id, dto);
  }

  // Only HR Admin + System Admin can delete holidays
  @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
