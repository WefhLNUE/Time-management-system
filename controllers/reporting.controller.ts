import { Controller, Get, Query } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';

@Controller('time-management/reports')
export class ReportingController {
  constructor(private readonly svc: ReportingService) {}

  @Get('exceptions-summary')
  exceptionsSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.exceptionsSummary(from, to);
  }

  @Get('overtime-summary')
  overtimeSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.overtimeSummary(from, to);
  }

  @Get('lateness-summary')
  latenessSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.latenessSummary(from, to);
  }

  @Get('dashboard-kpis')
  dashboardKpis(@Query('period') period?: string) {
    return this.svc.dashboardKpis(period);
  }
}
