import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// ---------------------
// M1 Models
// ---------------------
import { NotificationLog, NotificationLogSchema } from './Models/notification-log.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestSchema } from './Models/attendance-correction-request.schema';
import { ShiftType, ShiftTypeSchema } from './Models/shift-type.schema';
import { ScheduleRule, ScheduleRuleSchema } from './Models/schedule-rule.schema';
import { AttendanceRecord, AttendanceRecordSchema } from './Models/attendance-record.schema';
import { TimeException, TimeExceptionSchema } from './Models/time-exception.schema';
import { OvertimeRule, OvertimeRuleSchema } from './Models/overtime-rule.schema';
import { Shift, ShiftSchema } from './Models/shift.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from './Models/shift-assignment.schema';
import { LatenessRule, latenessRuleSchema } from './Models/lateness-rule.schema';
import { Holiday, HolidaySchema } from './Models/holiday.schema';

// ---------------------
// Main Controllers (A+B)
// ---------------------
import { ShiftTypeController } from './controllers/shift-type.controller';
import { ShiftController } from './controllers/shift.controller';
import { ScheduleRuleController } from './controllers/schedule-rule.controller';
import { ShiftAssignmentController } from './controllers/shift-assignment.controller';

// Optional
import { TimeManagementController } from './time-management.controller';

// ---------------------
// Part C Controllers
// ---------------------
import { ExceptionsController } from './controllers/exceptions.controller';
import { HolidaysController } from './controllers/holidays.controller';
import { ReportingController } from './controllers/reporting.controller';

// ---------------------
// Main Services (A+B)
// ---------------------
import { ShiftTypeService } from './services/shift-type.service';
import { ShiftService } from './services/shift.service';
import { ScheduleRuleService } from './services/schedule-rule.service';
import { ShiftAssignmentService } from './services/shift-assignment.service';
import { NotificationService } from './services/notification.service';

import { ShiftExpiryCron } from './cron/shift-expiry.cron';

// Optional
import { TimeManagementService } from './time-management.service';

// ---------------------
// Part C Services
// ---------------------
import { ExceptionsService } from './services/exceptions.service';
import { HolidaysService } from './services/holidays.service';
import { ReportingService } from './services/reporting.service';
import { IntegrationService } from './services/integration.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },
    ]),
  ],

  controllers: [
    // A+B controllers
    ShiftTypeController,
    ShiftController,
    ScheduleRuleController,
    ShiftAssignmentController,

    // Part C controllers
    ExceptionsController,
    HolidaysController,
    ReportingController,

    // Optional legacy
    TimeManagementController,
  ],

  providers: [
    // A+B
    ShiftTypeService,
    ShiftService,
    ScheduleRuleService,
    ShiftAssignmentService,
    NotificationService,
    ShiftExpiryCron,

    // C
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,

    // Optional legacy
    TimeManagementService,
  ],

  exports: [
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,
  ],
})
export class TimeManagementModule {}
