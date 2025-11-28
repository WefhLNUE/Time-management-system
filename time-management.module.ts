import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExceptionsController } from './controllers/exceptions.controller';
import { HolidaysController } from './controllers/holidays.controller';
import { ReportingController } from './controllers/reporting.controller';

import { ExceptionsService } from './services/exceptions.service';
import { HolidaysService } from './services/holidays.service';
import { ReportingService } from './services/reporting.service';
import { IntegrationService } from './services/integration.service';

// M1 Models
import { NotificationLogSchema } from './Models/notification-log.schema';
import { AttendanceCorrectionRequestSchema } from './Models/attendance-correction-request.schema';
import { ShiftTypeSchema } from './Models/shift-type.schema';
import { ScheduleRuleSchema } from './Models/schedule-rule.schema';
import { AttendanceRecordSchema } from './Models/attendance-record.schema';
import { TimeExceptionSchema } from './Models/time-exception.schema';
import { OvertimeRuleSchema } from './Models/overtime-rule.schema';
import { ShiftSchema } from './Models/shift.schema';
import { ShiftAssignmentSchema } from './Models/shift-assignment.schema';
import { latenessRuleSchema } from './Models/lateness-rule.schema';
import { HolidaySchema } from './Models/holiday.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'NotificationLog', schema: NotificationLogSchema },
      { name: 'AttendanceCorrectionRequest', schema: AttendanceCorrectionRequestSchema },
      { name: 'ShiftType', schema: ShiftTypeSchema },
      { name: 'ScheduleRule', schema: ScheduleRuleSchema },
      { name: 'AttendanceRecord', schema: AttendanceRecordSchema },
      { name: 'TimeException', schema: TimeExceptionSchema },
      { name: 'OvertimeRule', schema: OvertimeRuleSchema },
      { name: 'Shift', schema: ShiftSchema },
      { name: 'ShiftAssignment', schema: ShiftAssignmentSchema },
      { name: 'LatenessRule', schema: latenessRuleSchema },
      { name: 'Holiday', schema: HolidaySchema },
    ]),
  ],

  controllers: [
    ExceptionsController,
    HolidaysController,
    ReportingController,
  ],

  providers: [
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,
  ],

  exports: [
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,
  ],
})
export class TimeManagementModule {}
