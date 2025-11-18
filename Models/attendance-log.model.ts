import mongoose from 'mongoose'
import { Schema, Document, Types, model } from 'mongoose';
export interface AttendanceLog extends Document {
  employeeId: {
    type: Types.ObjectId,
    ref: 'Employee', // Replace with your actual Employee model name
    required: true,
  },
  shiftAssignmentId: {
    type: Types.ObjectId,
    ref: 'ShiftAssignment', // Replace with your actual ShiftAssignment model name
    required: true, // optional if not required
  },
  clockIn: Date;
  clockOut?: Date;
  attendanceStatus: 'Present' | 'Absent' | 'Late' | 'MissedPunch';
  createdAt: Date;
}
const AttendanceLogSchema = new Schema<AttendanceLog>({
  employeeId: { type: String, required: true },
  shiftAssignmentId: { type: Schema.Types.ObjectId, ref: 'ShiftAssignment', required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  attendanceStatus: { type: String, enum: ['Present', 'Absent', 'Late', 'MissedPunch'], required: true },
  createdAt: { type: Date, default: Date.now },
});
export const AttendanceLogModel = model<AttendanceLog>('AttendanceLog', AttendanceLogSchema);