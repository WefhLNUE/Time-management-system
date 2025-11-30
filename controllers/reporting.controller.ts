import { Controller, Get, Query } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/reports')
export class ReportingController {
  constructor(private readonly svc: ReportingService) {}

  // Exceptions reporting → HR + Managers + System Admin
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'PAYROLL_OFFICER', 'FINANCE_STAFF', 'SYSTEM_ADMIN')
  @Get('exceptions-summary')
  exceptionsSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.exceptionsSummary(from, to);
  }

  // Overtime affects payroll → HR + Payroll + Finance + System Admin
  @Roles('HR_MANAGER', 'HR_ADMIN', 'PAYROLL_OFFICER', 'FINANCE_STAFF', 'SYSTEM_ADMIN')
  @Get('overtime-summary')
  overtimeSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.overtimeSummary(from, to);
  }

  // Lateness is monitored by HR + Managers + System Admin
  @Roles('HR_MANAGER', 'HR_ADMIN', 'LINE_MANAGER', 'SYSTEM_ADMIN')
  @Get('lateness-summary')
  latenessSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.latenessSummary(from, to);
  }

  // KPIs used by HR leadership + Admins + System Admin
  @Roles('HR_MANAGER', 'HR_ADMIN', 'SYSTEM_ADMIN')
  @Get('dashboard-kpis')
  dashboardKpis(@Query('period') period?: string) {
    return this.svc.dashboardKpis(period);
  }
}
