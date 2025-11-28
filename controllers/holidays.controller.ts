import { Controller, Post, Body, Get, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { HolidaysService } from '../services/holidays.service';

@Controller('time-management/holidays')
export class HolidaysController {
  constructor(private readonly svc: HolidaysService) {}

  @Post()
  create(@Body() dto: CreateHolidayDto) {
    return this.svc.createHoliday(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const h = await this.svc.findById(id);
    if (!h) throw new NotFoundException('Holiday not found');
    return h;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
