import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { UpdateExceptionStatusDto } from '../dto/update-exception-status.dto';
import { ExceptionsService } from '../services/exceptions.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/exceptions')
export class ExceptionsController {
  constructor(private readonly svc: ExceptionsService) {}

  // Employees can create exceptions (permissions, corrections, overtime, etc.)
  @Roles('EMPLOYEE')
  @Post()
  async create(@Body() dto: CreateExceptionDto) {
    return this.svc.createException(dto);
  }

  // Managers + HR + System Admin can view lists
  @Roles('HR_ADMIN', 'HR_MANAGER', 'LINE_MANAGER', 'SYSTEM_ADMIN')
  @Get()
  async list(
      @Query('status') status?: string,
      @Query('employeeId') employeeId?: string,
      @Query('assignedTo') assignedTo?: string,
      @Query('limit') limit = '50',
      @Query('skip') skip = '0',
  ) {
    const q = { status, employeeId, assignedTo };
    return this.svc.findAll(q, { limit: Number(limit), skip: Number(skip) });
  }

  // Everyone involved can view a single exception, including the employee
  @Roles('EMPLOYEE', 'HR_ADMIN', 'HR_MANAGER', 'LINE_MANAGER', 'SYSTEM_ADMIN')
  @Get(':id')
  async get(@Param('id') id: string) {
    const ex = await this.svc.findById(id);
    if (!ex) throw new NotFoundException('Exception not found');
    return ex;
  }

  // Updating status is ONLY for approvers (Manager, HR, Admin)
  @Roles('LINE_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateExceptionStatusDto) {
    try {
      return await this.svc.updateStatus(id, dto);
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(e.message);
    }
  }
}
