import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LatenessRuleService } from '../services/lateness-rule.service';
import { CreateLatenessRuleDto } from '../dto/create-lateness-rule.dto';
import { UpdateLatenessRuleDto } from '../dto/update-lateness-rule.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lateness-rules')
export class LatenessRuleController {
  constructor(private readonly service: LatenessRuleService) { }

  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Post()
  create(@Body() dto: CreateLatenessRuleDto) {
    return this.service.create(dto);
  }

  @Roles(SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLatenessRuleDto) {
    return this.service.update(id, dto);
  }

  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
