// escalation-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EscalationLog extends Document {
  @Prop({ required: true })
  type: string; // e.g. "Lateness", "Overtime", "PendingApproval"

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  status: string; // e.g. "Pending", "Resolved"

  @Prop({ type: Date })
  resolvedAt: Date;

  @Prop()
  resolvedBy: string;
}

export const EscalationLogSchema = SchemaFactory.createForClass(EscalationLog);
