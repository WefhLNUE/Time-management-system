import { Schema, Document, Types, model } from 'mongoose';
export interface MissedPunchAlert extends Document {
  attendanceLogId: Types.ObjectId;
  employeeId: string;
  alertSent: boolean;
  alertDate: Date;
  resolved: boolean;
  resolvedDate?: Date;
}
const MissedPunchAlertSchema = new Schema<MissedPunchAlert>({
  attendanceLogId: { type: Schema.Types.ObjectId, ref: 'AttendanceLog', required: true },
  employeeId: { type: String, required: true },
  alertSent: { type: Boolean, default: false },
  alertDate: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedDate: { type: Date },
});//////////////////////
export const MissedPunchAlertModel = model<MissedPunchAlert>('MissedPunchAlert', MissedPunchAlertSchema);