import { Schema, Document, Types, model } from 'mongoose';
export interface AttendanceLog extends Document {
  employeeId: string;
  shiftAssignmentId: Types.ObjectId;
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