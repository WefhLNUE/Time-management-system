// repeated-lateness-tracking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

@Schema({ timestamps: true })
export class RepeatedLatenessTracking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ default: 0 })
  latenessCount: number;

  @Prop({ type: [Date], default: [] })
  latenessDates: Date[];

  @Prop({ default: false })
  escalated: boolean;

  @Prop({ type: Date })
  lastResetDate: Date;
}

export const RepeatedLatenessTrackingSchema = SchemaFactory.createForClass(RepeatedLatenessTracking);
export const RepeatedLatenessTrackingModel = model<RepeatedLatenessTracking>('RepeatedLatenessTracking', RepeatedLatenessTrackingSchema);