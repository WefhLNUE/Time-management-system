import { Schema, Document, Types, model } from 'mongoose';
export interface PermissionPolicy extends Document {
  maxDurationMinutes: number;
  requiresApproval: boolean;
  payrollAffecting: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const PermissionPolicySchema = new Schema<PermissionPolicy>({
  maxDurationMinutes: { type: Number, required: true },
  requiresApproval: { type: Boolean, required: true },
  payrollAffecting: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});////////////////

export const PermissionPolicyModel = model<PermissionPolicy>('PermissionPolicy', PermissionPolicySchema);