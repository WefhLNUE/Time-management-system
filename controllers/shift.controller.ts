import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftService } from '../services/shift.service';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly svc: ShiftService) {}

  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.svc.update(id, dto);
  }
}
