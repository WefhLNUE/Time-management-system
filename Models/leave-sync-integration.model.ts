import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose'; //ha2ool le youssef

export type LeaveSyncIntegrationDocument = LeaveSyncIntegration & Document;

@Schema({ timestamps: true, collection: 'leave_sync_integrations' })
export class LeaveSyncIntegration {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId!: Types.ObjectId;

  @Prop({ required: true })
  leaveType!: string;

  @Prop({ type: [Date] })
  linkedAttendanceDays?: Date[];

  @Prop({ type: String, enum: ['pending', 'processed', 'error'], default: 'pending' })
  processedStatus?: 'pending' | 'processed' | 'error';
}

export const LeaveSyncIntegrationSchema = SchemaFactory.createForClass(LeaveSyncIntegration);

// After
export const LeaveSyncIntegrationModel = model<LeaveSyncIntegration>('LeaveSyncIntegration', LeaveSyncIntegrationSchema);
