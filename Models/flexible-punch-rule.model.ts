import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlexiblePunchRuleDocument = FlexiblePunchRule & Document;

@Schema({ timestamps: true, collection: 'flexible_punch_rules' })
export class FlexiblePunchRule {
  @Prop({ type: Boolean, default: false })
  allowMultiplePunchesPerDay?: boolean;

  @Prop({ type: Boolean, default: true })
  useFirstInLastOutPattern?: boolean;

  @Prop({ type: String, enum: ['nearest', 'ceiling', 'floor'], default: 'nearest' })
  roundingMethod?: 'nearest' | 'ceiling' | 'floor';

  @Prop({ type: Number, default: 15 }) // rounding interval in minutes
  roundingIntervalMinutes?: number;
}

export const FlexiblePunchRuleSchema = SchemaFactory.createForClass(FlexiblePunchRule);

