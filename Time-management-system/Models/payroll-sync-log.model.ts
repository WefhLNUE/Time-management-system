import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollSyncLogDocument = PayrollSyncLog & Document;

@Schema({ timestamps: true, collection: 'payroll_sync_logs' })
export class PayrollSyncLog {
  @Prop({ required: true })
  date!: Date;

  @Prop({ type: Number, default: 0 })
  recordsSynced?: number;

  @Prop({ type: String, enum: ['pending', 'success', 'failed'], default: 'pending' })
  status?: 'pending' | 'success' | 'failed';

  @Prop()
  triggeredBy?: string;

  @Prop({ type: String, maxlength: 400 })
  remarks?: string;
}

export const PayrollSyncLogSchema = SchemaFactory.createForClass(PayrollSyncLog);
