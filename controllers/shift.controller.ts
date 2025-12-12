import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftService } from '../services/shift.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly svc: ShiftService) {}

  // Only HR Manager, HR Admin, System Admin can create shifts

     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.SYSTEM_ADMIN
  )
  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.svc.create(dto);
  }

  // Everyone except employees? No — employees CAN view shift definitions.
     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN
  )
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // Everyone can view a single shift
     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // Update shift → Only HR Manager, HR Admin, System Admin

    @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.SYSTEM_ADMIN
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.svc.update(id, dto);
  }
}
