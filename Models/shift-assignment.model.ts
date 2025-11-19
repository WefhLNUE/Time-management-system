import mongoose from 'mongoose';
import { Schema, Document, Types, model } from 'mongoose';
export interface ShiftAssignment extends Document {
 employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Name of the referenced collection/model
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Name of the referenced collection/model
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position', // Name of the referenced collection/model
  },
  shiftType: string;
  startDate: Date;
  endDate?: Date;
  status: 'Approved' | 'Cancelled' | 'Expired' | 'Pending';
  createdAt: Date;
  updatedAt: Date;////////////////////////
}
const ShiftAssignmentSchema = new Schema<ShiftAssignment>({
employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Name of the referenced collection/model
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Name of the referenced collection/model
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position', // Name of the referenced collection/model
  },
  shiftType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Approved', 'Cancelled', 'Expired', 'Pending'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const ShiftAssignmentModel = model<ShiftAssignment>('ShiftAssignment', ShiftAssignmentSchema);