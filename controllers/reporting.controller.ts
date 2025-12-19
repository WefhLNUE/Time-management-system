import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/reports')
export class ReportingController {
  constructor(private readonly svc: ReportingService) {}

  // Exceptions → HR, Managers, Payroll, Admin
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.DEPARTMENT_EMPLOYEE,
      SystemRole.FINANCE_STAFF,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('exceptions-summary')
  exceptionsSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.exceptionsSummary(from, to);
  }

  // Overtime → Payroll & Finance
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.FINANCE_STAFF,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('overtime-summary')
  overtimeSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.overtimeSummary(from, to);
  }

  // Lateness → HR & Managers
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('lateness-summary')
  latenessSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.latenessSummary(from, to);
  }

  // Dashboard KPIs
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('dashboard-kpis')
  dashboardKpis() {
    return this.svc.dashboardKpis();
  }
}
