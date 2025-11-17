import { Schema, Document, Types, model } from 'mongoose';
export interface ShiftAssignment extends Document {
  employeeId: string;
  departmentId?: string;
  positionId?: string;
  shiftType: string;
  startDate: Date;
  endDate?: Date;
  status: 'Approved' | 'Cancelled' | 'Expired' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}
const ShiftAssignmentSchema = new Schema<ShiftAssignment>({
  employeeId: { type: String, required: true },
  departmentId: { type: String },
  positionId: { type: String },
  shiftType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Approved', 'Cancelled', 'Expired', 'Pending'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const ShiftAssignmentModel = model<ShiftAssignment>('ShiftAssignment', ShiftAssignmentSchema);