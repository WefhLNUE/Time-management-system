import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { CorrectionService } from '../services/correction.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { CorrectionRequestDto } from '../dto/correction-request.dto';
import { UpdateCorrectionStatusDto } from '../dto/update-correction-status.dto';

@Controller('attendance/corrections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CorrectionController {
  constructor(private readonly svc: CorrectionService) { }

  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @Post()
  create(@Body() dto: CorrectionRequestDto) {
    return this.svc.createRequest(dto);
  }

  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  @Patch(':id')
  review(@Param('id') id: string, @Body() dto: UpdateCorrectionStatusDto) {
    return this.svc.reviewRequest(id, dto);
  }
}
