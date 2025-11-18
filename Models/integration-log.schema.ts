// integration-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';

@Schema({ timestamps: true })
export class IntegrationLog extends Document {
  @Prop({ required: true })
  sourceModule: string; // e.g. "Time Management"

  @Prop({ required: true })
  targetModule: string; // e.g. "Payroll"

  @Prop({ required: true })
  operation: string; // e.g. "Sync Attendance", "Push Overtime"

  @Prop({ default: 'Success' })
  status: string;

  @Prop()
  details: string;

  @Prop({ type: Date })
  syncedAt: Date;
}

export const IntegrationLogSchema = SchemaFactory.createForClass(IntegrationLog);
export const IntegrationLogModel = model<IntegrationLog>('IntegrationLog', IntegrationLogSchema);