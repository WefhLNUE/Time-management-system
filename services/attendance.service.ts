import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from '../Models/attendance-record.schema';

import { TimeExceptionType, ShiftAssignmentStatus } from '../Models/enums';
import { ExceptionsService } from './exceptions.service';
import { PunchDto } from '../dto/punch.dto';

import { LatenessRule } from '../Models/lateness-rule.schema';
import { OvertimeRule } from '../Models/overtime-rule.schema';
import { ShiftAssignment } from '../Models/shift-assignment.schema';
import { Shift } from '../Models/shift.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel('AttendanceRecord')
    private readonly attendance: Model<AttendanceRecordDocument>,

    @InjectModel(LatenessRule.name)
    private readonly latenessRuleModel: Model<LatenessRule>,

    @InjectModel(OvertimeRule.name)
    private readonly overtimeRuleModel: Model<OvertimeRule>,

    @InjectModel(ShiftAssignment.name)
    private readonly assignmentModel: Model<ShiftAssignment>,

    private readonly exceptionsSvc: ExceptionsService,
  ) {}

  async findForEmployee(employeeId: string) {
    return this.attendance
      .find({ employeeId })
      .sort({ _id: -1 })
      .lean();
  }

  async processPunch(dto: PunchDto) {
    const { employeeId, punchType, time } = dto;
    const timestamp = new Date(time);

    let record: AttendanceRecordDocument | null =
      await this.attendance.findOne({ employeeId }).sort({ _id: -1 });

    if (!record || record.punches.length % 2 === 0) {
      record = await this.attendance.create({
        employeeId,
        punches: [],
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        finalisedForPayroll: false,
      });
    }

    record.punches.push({ type: punchType, time: timestamp });

    const isValid = this.validateSequence(record.punches);
    if (!isValid) {
      record.hasMissedPunch = true;

      await this.exceptionsSvc.createException({
        employeeId,
        attendanceRecordId: record._id.toString(),
        type: TimeExceptionType.MISSED_PUNCH,
        reason: 'Invalid IN/OUT sequence',
        assignedTo: employeeId,
      });

      await record.save();
      return record;
    }

    record.hasMissedPunch = false;

    const assignment = await this.getActiveAssignment(employeeId, timestamp);
    const shift = assignment?.shiftId as Shift | undefined;

    // =====================
    // LATENESS (IN)
    // =====================
    if (punchType === 'IN' && record.punches.length === 1 && shift) {
      await this.handleLateness(employeeId, record, timestamp, shift);
    }

    // =====================
    // WORK MINUTES + OVERTIME
    // =====================
    if (record.punches.length >= 2) {
      const firstIn = record.punches[0].time;
      const lastOut = record.punches[record.punches.length - 1].time;

      record.totalWorkMinutes = Math.floor(
        (lastOut.getTime() - firstIn.getTime()) / 60000,
      );

      if (punchType === 'OUT' && shift) {
        await this.handleOvertime(employeeId, record, lastOut, shift);
      }
    }

    await record.save();
    return record;
  }

  validateSequence(punches: { type: string }[]) {
    let expected = 'IN';
    for (const p of punches) {
      if (p.type !== expected) return false;
      expected = expected === 'IN' ? 'OUT' : 'IN';
    }
    return true;
  }

  // =========================
  // SHIFT RESOLUTION
  // =========================
  private async getActiveAssignment(employeeId: string, date: Date) {
    return this.assignmentModel
      .findOne({
        employeeId,
        status: ShiftAssignmentStatus.APPROVED,
        startDate: { $lte: date },
        $or: [{ endDate: null }, { endDate: { $gte: date } }],
      })
      .populate('shiftId')
      .lean();
  }

  // =========================
  // LATENESS
  // =========================
  private async handleLateness(
    employeeId: string,
    record: AttendanceRecordDocument,
    actualIn: Date,
    shift: Shift,
  ) {
    const latenessRule = await this.latenessRuleModel.findOne({ active: true });

    const shiftStart = this.buildTime(actualIn, shift.startTime);
    const shiftGrace = shift.graceInMinutes ?? 0;
    const ruleGrace = latenessRule?.gracePeriodMinutes ?? 0;

    const totalGrace = shiftGrace + ruleGrace;

    const lateMinutes = Math.floor(
      (actualIn.getTime() - shiftStart.getTime()) / 60000,
    );

    if (lateMinutes <= totalGrace) return;

    await this.exceptionsSvc.createException({
      employeeId,
      attendanceRecordId: record._id.toString(),
      type: TimeExceptionType.LATE,
      reason: `Late by ${lateMinutes - totalGrace} minutes`,
      assignedTo: employeeId,
    });
  }

  // =========================
  // OVERTIME
  // =========================
  private async handleOvertime(
    employeeId: string,
    record: AttendanceRecordDocument,
    actualOut: Date,
    shift: Shift,
  ) {
    const overtimeRule = await this.overtimeRuleModel.findOne({ active: true });
    if (!overtimeRule) return;

    let shiftEnd = this.buildTime(actualOut, shift.endTime);

    // overnight shift
    if (shift.endTime <= shift.startTime) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    shiftEnd.setMinutes(
      shiftEnd.getMinutes() + (shift.graceOutMinutes ?? 0),
    );

    const overtimeMinutes = Math.floor(
      (actualOut.getTime() - shiftEnd.getTime()) / 60000,
    );

    if (overtimeMinutes <= 0) return;

    await this.exceptionsSvc.createException({
      employeeId,
      attendanceRecordId: record._id.toString(),
      type: TimeExceptionType.OVERTIME_REQUEST,
      reason: `Overtime ${overtimeMinutes} minutes`,
      assignedTo: employeeId,
    });
  }

  // =========================
  // TIME PARSER
  // =========================
  private buildTime(base: Date, time: string) {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }
}
