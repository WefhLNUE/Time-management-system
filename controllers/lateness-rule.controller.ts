import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LatenessRuleService } from '../services/lateness-rule.service';
import { CreateLatenessRuleDto } from '../dto/create-lateness-rule.dto';
import { UpdateLatenessRuleDto } from '../dto/update-lateness-rule.dto';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lateness-rules')
export class LatenessRuleController {
  constructor(private readonly service: LatenessRuleService) {}

  @Post()
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
  create(@Body() dto: CreateLatenessRuleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLatenessRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
