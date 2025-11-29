import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ScheduleRuleService } from '../services/schedule-rule.service';
import { CreateScheduleRuleDto } from '../dto/create-schedule-rule.dto';

@Controller('schedule-rules')
export class ScheduleRuleController {
  constructor(private readonly svc: ScheduleRuleService) {}

  @Post()
  create(@Body() dto: CreateScheduleRuleDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Patch(':id')
  update() {
    // implement as needed
  }
}
