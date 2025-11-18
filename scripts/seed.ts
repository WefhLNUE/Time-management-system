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
import mongooseModule from 'mongoose'
//

async function main() {
  await mongoose.connect(
    'mongodb+srv://dareen:mVn7PHAnoLOJ6jSB@hrcuster.fqiw4vw.mongodb.net/?retryWrites=true&w=majority'
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
    LatenessRuleModel.deleteMany({})
  ]);

  

  console.log('Collections cleared');

  // ------------------------------
  // Step 1: Create Dummy Shift Assignments
  // ------------------------------
  const shift1 = await ShiftAssignmentModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: 'EMP001',
    departmentId: 'DEPT01',
    positionId: 'POS01',
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
    employeeId: 'EMP001',
    shiftAssignmentId: shift1._id,
    clockIn: new Date('2025-11-10T08:05:00Z'),
    clockOut: new Date('2025-11-10T16:00:00Z'),
    attendanceStatus: 'Late',
    createdAt: new Date(),
  });

  const attendance2 = await AttendanceLogModel.create({
    _id: new mongoose.Types.ObjectId(),
    employeeId: 'EMP002',
    shiftAssignmentId: shift2._id,
    clockIn: new Date('2025-11-10T22:00:00Z'),
    attendanceStatus: 'Present',
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
    attendanceLogId: attendance2._id,
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

  const permission2 = await PermissionPolicyModel.create({
    _id: new mongoose.Types.ObjectId(),
    maxDurationMinutes: 30,
    requiresApproval: false,
    payrollAffecting: false,
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
await TimeExceptionRequestModel.create({
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
  requestId: new mongoose.Types.ObjectId(),  // link to a TimeExceptionRequest
  approverId: new mongoose.Types.ObjectId(), // link to a User
  action: 'approved', // must be 'approved', 'rejected', or 'escalated'
  actionDate: new Date('2025-11-17T10:00:00Z'),
  remarks: 'Approved automatically for testing'
});

  // ------------------------------
  // Step 6: Attendance Correction Request
  // ------------------------------
    const attendanceCorrection1 = await AttendanceCorrectionRequestModel.create({
      _id: new mongoose.Types.ObjectId(),
      employeeId: new mongoose.Types.ObjectId(),
      attendanceLogId: new mongoose.Types.ObjectId(),
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



  console.log('Dummy data inserted successfully!');
  process.exit(0);
}

main().catch(console.error);