import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OvertimeRuleDocument = OvertimeRule & Document;

@Schema({ timestamps: true, collection: 'overtime_rules' })
export class OvertimeRule {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  calculationMethod!: string;

  @Prop({ type: Boolean, default: false })
  isPreApprovalRequired?: boolean;

  @Prop({ type: Number, default: 1.5 })
  weekendRate?: number;

  @Prop({ type: Number, default: 2 })
  holidayRate?: number;

  @Prop()
  effectiveFrom?: Date;

  @Prop()
  createdBy?: string;
}

export const OvertimeRuleSchema = SchemaFactory.createForClass(OvertimeRule);
