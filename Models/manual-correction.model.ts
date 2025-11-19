import { Schema, Document, Types, model } from 'mongoose';
export interface ManualCorrection extends Document {
  attendanceLogId: Types.ObjectId;
  correctedById: string;
  correctionType: 'Add Punch' | 'Delete Punch' | 'Modify Punch';
  correctionReason: string;
  correctedClockIn?: Date;
  correctedClockOut?: Date;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}
const ManualCorrectionSchema = new Schema<ManualCorrection>({
  attendanceLogId: { type: Schema.Types.ObjectId, ref: 'AttendanceLog', required: true },
  correctedById: { type: String, required: true },
  correctionType: { type: String, enum: ['Add Punch', 'Delete Punch', 'Modify Punch'], required: true },
  correctionReason: { type: String, required: true },
  correctedClockIn: { type: Date },
  correctedClockOut: { type: Date },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});/////////////////////
export const ManualCorrectionModel = model<ManualCorrection>('ManualCorrection', ManualCorrectionSchema);