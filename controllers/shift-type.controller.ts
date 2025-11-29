import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';
import { ShiftTypeService } from '../services/shift-type.service';

@Controller('shift-types')
export class ShiftTypeController {
  constructor(private readonly svc: ShiftTypeService) {}

  @Post()
  create(@Body() dto: CreateShiftTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftTypeDto) {
    return this.svc.update(id, dto);
  }
}
