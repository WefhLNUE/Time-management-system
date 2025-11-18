import mongoose from 'mongoose';

import { AttendanceLogModel } from "../Models/attendance-log.model";
import { ManualCorrectionModel } from "../Models/manual-correction.model";
import { MissedPunchAlertModel } from "../Models/missed-punch-alert.model";
import { PermissionPolicyModel } from "../Models/permission-policy.model";
import { ShiftAssignmentModel } from "../Models/shift-assignment.model";
import { LeaveSyncIntegrationModel } from "../Models/leave-sync-integration.model";
import { OvertimeRuleModel } from "../Models/overtime-rule.model";
import { PayrollSyncLogModel } from "../Models/payroll-sync-log.model";
import { TimeExceptionRequestModel } from "../Models/time-exception-request.model";
import { ApprovalWorkflowModel } from "../Models/approval-workflow.models";
import { AttendanceCorrectionRequestModel } from "../Models/attendance-correction-request.model";
import { AuditTrailModel } from "../Models/audit-trail.model";
import { FlexiblePunchRuleModel } from "../Models/flexible-punch-rule.model";
import { LatenessRuleModel } from "../Models/lateness-rule.model";
import { ShiftTypeModel } from "../Models/shift-type.schema";
import { RepeatedLatenessTrackingModel } from "../Models/repeated-lateness-tracking.schema";
import { VacationPackageLinkModel } from "../Models/vacation-package-link.schema";
import { CustomSchedulingRuleModel } from "../Models/custom-scheduling-rule.schema";
import { EscalationLogModel } from "../Models/escalation-log.schema";
import { HolidayAndRestDayModel } from "../Models/holiday-and-rest-day.schema";
import { IntegrationLogModel } from "../Models/integration-log.schema";
import { OvertimeExceptionReportModel } from "../Models/overtime-exception-report.schema";    
import { EmployeeSchema } from "../../employee-profile-new/employee-profile/models/employee.schema";
import { DepartmentSchema } from "../../employee-profile-new/organizational-structure/models/department.schema";
import { PositionSchema } from "../../employee-profile-new/organizational-structure/models/position.schema";
import { DepartmentManagerSchema } from "../../employee-profile-new/employee-profile/models/departmentManager.schema";
import { HRManagerSchema } from "../../employee-profile-new/employee-profile/models/hrmanager.schema";
import { LeaveBalanceSchema } from 'leaves-subsystem/Models/leave-balance.schema';
import { LeaveRequestSchema } from 'leaves-subsystem/Models/leave-request.schema';
//
//i am hear
async function main() {
  await mongoose.connect(
    'mongodb+srv://dareen:mVn7PHAnoLOJ6jSB@hrcuster.fqiw4vw.mongodb.net/test?retryWrites=true&w=majority'
  );
  console.log('Connected to MongoDB');

   
  // Clear existing data
  await Promise.all([ 
    AttendanceLogModel.deleteMany({}),
    ManualCorrectionModel.deleteMany({}),
    MissedPunchAlertModel.deleteMany({}),
    PermissionPolicyModel.deleteMany({}),
    ShiftAssignmentModel.deleteMany({}),
    LeaveSyncIntegrationModel.deleteMany({}),
    OvertimeRuleModel.deleteMany({}),
    PayrollSyncLogModel.deleteMany({}),
    TimeExceptionRequestModel.deleteMany({}),
    ApprovalWorkflowModel.deleteMany({}),
    AttendanceCorrectionRequestModel.deleteMany({}),
    AuditTrailModel.deleteMany({}),
    FlexiblePunchRuleModel.deleteMany({}),
    LatenessRuleModel.deleteMany({}),
    ShiftTypeModel.deleteMany({}),
    RepeatedLatenessTrackingModel.deleteMany({}),
    VacationPackageLinkModel.deleteMany({}),
    CustomSchedulingRuleModel.deleteMany({}),
    EscalationLogModel.deleteMany({}),
    HolidayAndRestDayModel.deleteMany({}),
    IntegrationLogModel.deleteMany({}),
    OvertimeExceptionReportModel.deleteMany({}),
    

  ]);


  

  console.log('Collections cleared');

  const Employee = mongoose.model('Employee', EmployeeSchema);
  const DepartmentManager = mongoose.model('DepartmentManager', DepartmentManagerSchema);
  const HRManager = mongoose.model('HRManager', HRManagerSchema);
  const Department = mongoose.model('Department', DepartmentSchema);
  const Position = mongoose.model('Position', PositionSchema);
  const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);
  const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
 

  const employee = await Employee.findOne();
  const manager = await DepartmentManager.findOne();
  const hr = await HRManager.findOne();
  const department = await Department.findOne();
  const position = await Position.findOne();
  const leaveBalance = await LeaveBalance.findOne();
  const leaveRequest = await LeaveRequest.findOne();

if (!employee || !manager || !hr || !department || !position) {
    console.error('Missing employee, manager, or HR manager. Run main seed first.');
    process.exit(1);
   }

  // ------------------------------
  // Step 1: Create Dummy Shift Assignments
  // ------------------------------
  const shift1 = await ShiftAssignmentModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: employee._id,
    departmentId: department._id,
    positionId: position._id,
    shiftType: 'Morning',
    startDate: new Date('2025-11-01T08:00:00Z'),
    endDate: new Date('2025-11-30T16:00:00Z'),
    status: 'Approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const shift2 = await ShiftAssignmentModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: 'EMP002',
    shiftType: 'Night',
    startDate: new Date('2025-11-05T22:00:00Z'),
    status: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ------------------------------
  // Step 2: Create Dummy Attendance Logs
  // ------------------------------
  const attendance1 = await AttendanceLogModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: employee._id,
    departmentId: department._id,
    positionId: position._id,
    shiftAssignmentId: shift1._id,
    clockIn: new Date('2025-11-10T08:05:00Z'),
    clockOut: new Date('2025-11-10T16:00:00Z'),
    attendanceStatus: 'Late',
    createdAt: new Date(),
  });

  

  // ------------------------------
  // Step 3: Create Dummy Manual Corrections
  // ------------------------------
  const manualCorrection1 = await ManualCorrectionModel.create({
    _id: new mongoose.Types.ObjectId(),
    attendanceLogId: attendance1._id,
    correctedById: 'HR001',
    correctionType: 'Modify Punch',
    correctionReason: 'Employee clocked in late due to traffic',
    correctedClockIn: new Date('2025-11-10T08:00:00Z'),
    approvalStatus: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ------------------------------
  // Step 4: Create Dummy Missed Punch Alerts
  // ------------------------------
  const missedPunch1 = await MissedPunchAlertModel.create({
    _id: new mongoose.Types.ObjectId(),
    attendanceLogId: attendance1._id,
    employeeId: 'EMP002',
    alertSent: true,
    alertDate: new Date('2025-11-11T09:00:00Z'),
    resolved: false,
  });

  // ------------------------------
  // Step 5: Create Dummy Permission Policies
  // ------------------------------
  const permission1 = await PermissionPolicyModel.create({
    _id: new mongoose.Types.ObjectId(),
    maxDurationMinutes: 60,
    requiresApproval: true,
    payrollAffecting: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

 

  // ------------------------------
  // Step 1: Leave Sync Integration
  // ------------------------------
  await LeaveSyncIntegrationModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: new mongoose.Types.ObjectId(),
    leaveType: "Annual",
    leaveBalanceBefore: 14,
    leaveBalanceAfter: 13,
    syncedAt: new Date("2025-11-17T10:00:00Z"),
    status: "SUCCESS",
    externalReferenceId: new mongoose.Types.ObjectId()
  });

  // ------------------------------
  // Step 2: Overtime Rule
  // ------------------------------
await OvertimeRuleModel.create({
  _id: new mongoose.Types.ObjectId(),
  name: "Weekday Overtime",             // matches schema
  rateMultiplier: 1.5,
  minMinutes: 30,
  autoApprove: false,
  appliesOnWeekends: false,
  calculationMethod: "Hourly",          // this field is required
  createdAt: new Date("2025-10-10T08:00:00Z"),
  updatedAt: new Date("2025-10-10T08:00:00Z")
});

  // ------------------------------
  // Step 3: Payroll Sync Log
  // ------------------------------
await PayrollSyncLogModel.create({
  _id: new mongoose.Types.ObjectId(),
  employeeId: new mongoose.Types.ObjectId(),
  date: new Date("2025-10-31T23:59:00Z"),   // <-- required field
  status: "success",                         // <-- must match schema enum
  details: "Payroll data synced successfully",
  attempts: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});


  // ------------------------------
  // Step 4: Time Exception Request
  // ------------------------------
const timeException = await TimeExceptionRequestModel.create({
  _id: new mongoose.Types.ObjectId(),
  employeeId: new mongoose.Types.ObjectId(),
  type: 'correction',                 // matches enum
  requestReason: 'Internet outage at office',
  status: 'pending',                  // matches enum exactly
  currentApproverRole: 'LineManager', // matches enum exactly
  escalationDeadline: new Date('2025-11-16T17:00:00Z')
});


  // ------------------------------
  // Step 5: Approval Workflow
  // ------------------------------
  const workflowDummy = await ApprovalWorkflowModel.create({
  _id: new mongoose.Types.ObjectId(),
  requestId: timeException._id,  // link to a TimeExceptionRequest
  approverId: hr.hrManagerId, // link to a User
  action: 'approved', // must be 'approved', 'rejected', or 'escalated'
  actionDate: new Date('2025-11-17T10:00:00Z'),
  remarks: 'Approved automatically for testing'
});

  // ------------------------------
  // Step 6: Attendance Correction Request
  // ------------------------------
    const attendanceCorrection1 = await AttendanceCorrectionRequestModel.create({
      _id: new mongoose.Types.ObjectId(),
      employeeId: employee._id,
      attendanceLogId: attendance1._id,
      correctionReason: 'Forgot to punch in',
      status: 'pending',
  });

  // ------------------------------
  // Step 7: Audit Trail
  // ------------------------------
  const audit1 = await AuditTrailModel.create({
    _id: new mongoose.Types.ObjectId(),
    entityName: 'OvertimeRule',
    entityId: new mongoose.Types.ObjectId(),
    action: 'update',
    performedBy: 'adminUser',
    performedAt: new Date('2025-11-10T12:45:00Z'),
    details: { rateMultiplier: { old: 1.25, new: 1.5 } },
  });

  // ------------------------------
  // Step 8: Flexible Punch Rule
  // ------------------------------
  const flexiblePunch1 = await FlexiblePunchRuleModel.create({
    _id: new mongoose.Types.ObjectId(),
    allowMultiplePunchesPerDay: true,
    useFirstInLastOutPattern: true,
    roundingMethod: 'nearest',
    roundingIntervalMinutes: 15,
  });
  // ------------------------------
  // Step 9: Lateness Rule
  // ------------------------------
  const latenessRule1 = await LatenessRuleModel.create({
    _id: new mongoose.Types.ObjectId(),
    gracePeriodMinutes: 5,
    latenessThreshold: 10,
    penaltyAmount: 50,
    escalationThreshold: 30,
    isActive: true,
  });

  //--------------------

 const customScheduling = await CustomSchedulingRuleModel.create({
  _id: new mongoose.Types.ObjectId(),
  name: "Flex Hours",
  description: "Employees can start anytime between 8 AM and 11 AM",
  ruleType: "Flexible",
  parameters: { "maxHoursPerWeek": 40, "minDailyHours": 6 },
  isActive: true,
  createdAt: new Date("2025-11-18T08:00:00Z"),
  updatedAt: new Date("2025-11-18T08:00:00Z")
});

//-----------------------

const escalationLog = await EscalationLogModel.create({
  _id: new mongoose.Types.ObjectId(),
  type: "Lateness",
  employeeId: employee._id,
  
  reason: "Arrived 30 minutes late",
  status: "Pending",
  resolvedAt: null,
  resolvedBy: null,
  createdAt: new Date("2025-11-18T09:15:00Z"),
  updatedAt: new Date("2025-11-18T09:15:00Z")
});

//-----------------------------
const HolidayandRestDay = await HolidayAndRestDayModel.create({
  _id: new mongoose.Types.ObjectId(),
  date: new Date('2025-06-01T00:00:00Z'),
  description: "EidHoliday",
  isRecurring: true,
  isCompanyHoliday: true,
  createdAt: new Date('2025-11-18T10:00:00Z'),
  updatedAt: new Date('2025-11-18T10:00:00Z')
});

const IntegrationLog = await IntegrationLogModel.create({
  _id: new mongoose.Types.ObjectId(),
  sourceModule: "TimeManagement",
  targetModule: "Payroll",
  operation: "SyncAttendance",
  status: "Success",
  details: "Attendance data synced successfully",
  syncedAt: new Date('2025-11-17T23:59:00Z'),
  createdAt: new Date('2025-11-18T10:30:00Z'),
  updatedAt: new Date('2025-11-18T10:30:00Z')
});

//---------------------------

const OvertimeExceptionReport = await OvertimeExceptionReportModel.create({
  _id: new mongoose.Types.ObjectId(),
  employeeId: new mongoose.Types.ObjectId(),
  date: new Date('2025-11-15T00:00:00Z'),
  hoursWorked: 12,
  approvedBy: HRManager,
  exceptionFlag: true,
  remarks: "Critical project deadline",
  createdAt: new Date('2025-11-18T11:00:00Z'),
  updatedAt: new Date('2025-11-18T11:00:00Z')
});

//-------------------------

const repeatedLatenessTracking = await RepeatedLatenessTrackingModel.create({
  _id: new mongoose.Types.ObjectId(),
  employeeId: new mongoose.Types.ObjectId(),
  latenessCount: 3,
  latenessDates: [
    new Date('2025-11-01T09:30:00Z'),
    new Date('2025-11-05T09:45:00Z'),
    new Date('2025-11-10T09:20:00Z')
  ],
  escalated: false,
  lastResetDate: new Date('2025-10-01T00:00:00Z'),
  createdAt: new Date('2025-11-18T11:30:00Z'),
  updatedAt: new Date('2025-11-18T11:30:00Z')
});

//-------------------------


const shiftType = await ShiftTypeModel.create({
  _id: new mongoose.Types.ObjectId(),
  name: "Full-time",
  description: "Standard 8-hour workday",
  startTime: "09:00:00",
  endTime: "17:00:00",
  createdAt: new Date("2025-11-18T12:00:00Z"),
  updatedAt: new Date("2025-11-18T12:00:00Z")
});

//-------------------------

const vacationPackageLink = await VacationPackageLinkModel.create({
  _id: new mongoose.Types.ObjectId(),
  employeeId: new mongoose.Types.ObjectId(),
  packageId: new mongoose.Types.ObjectId(),
  effectiveFrom: new Date('2025-01-01T00:00:00Z'),
  effectiveTo: new Date('2025-12-31T00:00:00Z'),
  isActive: true,
  createdAt: new Date('2025-11-18T12:30:00Z'),
  updatedAt: new Date('2025-11-18T12:30:00Z')
}
);



  console.log('Dummy data inserted successfully!');
  process.exit(0);
}

main().catch(console.error);