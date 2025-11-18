import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LatenessRuleDocument = LatenessRule & Document;

@Schema({ timestamps: true, collection: 'lateness_rules' })
export class LatenessRule {
  @Prop({ type: Number, required: true, min: 0 })
  gracePeriodMinutes!: number;

  @Prop({ type: Number, required: true, min: 0 })
  latenessThreshold!: number;

  @Prop({ type: Number, default: 0 })
  penaltyAmount?: number;

  @Prop({ type: Number })
  escalationThreshold?: number;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;
}

export const LatenessRuleSchema = SchemaFactory.createForClass(LatenessRule);
