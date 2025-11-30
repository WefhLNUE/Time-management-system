import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShiftAssignmentService } from '../services/shift-assignment.service';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';

@Controller('shift-assignments')
export class ShiftAssignmentController {
  constructor(private readonly svc: ShiftAssignmentService) {}

  @Post()
  create(@Body() dto: CreateShiftAssignmentDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('employee/:employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }
}
