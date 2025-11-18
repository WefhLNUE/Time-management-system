import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

export type AttendanceCorrectionRequestDocument = AttendanceCorrectionRequest & Document;

@Schema({ timestamps: true, collection: 'attendance_correction_requests' })
export class AttendanceCorrectionRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AttendanceLog', required: true })
  attendanceLogId!: Types.ObjectId;

  @Prop({ type: String, maxlength: 400, required: true })
  correctionReason!: string;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected';

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;
}

export const AttendanceCorrectionRequestSchema = SchemaFactory.createForClass(AttendanceCorrectionRequest);
export const AttendanceCorrectionRequestModel = model<AttendanceCorrectionRequest>('AttendanceCorrectionRequest', AttendanceCorrectionRequestSchema);
