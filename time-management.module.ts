import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// Models
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

// Controllers
import { ShiftTypeController } from './controllers/shift-type.controller';
import { ShiftController } from './controllers/shift.controller';
import { ScheduleRuleController } from './controllers/schedule-rule.controller';
import { ShiftAssignmentController } from './controllers/shift-assignment.controller';

// Services
import { ShiftTypeService } from './services/shift-type.service';
import { ShiftService } from './services/shift.service';
import { ScheduleRuleService } from './services/schedule-rule.service';
import { ShiftAssignmentService } from './services/shift-assignment.service';
import { NotificationService } from './services/notification.service';

// Cron Job
import { ShiftExpiryCron } from './cron/shift-expiry.cron';

// (Optional default controller/service)
import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';


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
    // new controllers
    ShiftTypeController,
    ShiftController,
    ScheduleRuleController,
    ShiftAssignmentController,

    // optional older controller
    TimeManagementController,
  ],

  providers: [
    // new services
    ShiftTypeService,
    ShiftService,
    ScheduleRuleService,
    ShiftAssignmentService,
    NotificationService,
    ShiftExpiryCron,

    // optional older service
    TimeManagementService,
  ],
})
export class TimeManagementModule {}
