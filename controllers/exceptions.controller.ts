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

@Controller('time-management/exceptions')
export class ExceptionsController {
  constructor(private readonly svc: ExceptionsService) {}

  @Post()
  async create(@Body() dto: CreateExceptionDto) {
    return this.svc.createException(dto);
  }

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

  @Get(':id')
  async get(@Param('id') id: string) {
    const ex = await this.svc.findById(id);
    if (!ex) throw new NotFoundException('Exception not found');
    return ex;
  }

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
