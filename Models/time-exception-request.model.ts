import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

export type TimeExceptionRequestDocument = TimeExceptionRequest & Document;

@Schema({ timestamps: true, collection: 'time_exception_requests' })
export class TimeExceptionRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: ['correction', 'overtime', 'permission'], required: true })
  type: 'correction' | 'overtime' | 'permission';

  @Prop({ type: Types.ObjectId, ref: 'AttendanceLog' })
  relatedAttendanceId?: Types.ObjectId;

  @Prop({ type: String, maxlength: 400 })
  requestReason: string;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected', 'escalated'], default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'escalated';

  @Prop({ type: String, enum: ['LineManager', 'HR', 'System'], required: true })
  currentApproverRole: 'LineManager' | 'HR' | 'System';

  @Prop({ type: Date })
  escalationDeadline?: Date;
}

export const TimeExceptionRequestSchema = SchemaFactory.createForClass(TimeExceptionRequest);
export const TimeExceptionRequestModel = model<TimeExceptionRequest>('TimeExceptionRequest', TimeExceptionRequestSchema);
