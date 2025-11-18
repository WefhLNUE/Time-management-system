// custom-scheduling-rule.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';

@Schema({ timestamps: true })
export class CustomSchedulingRule extends Document {
  @Prop({ required: true })
  name: string; // "Flex Hours", "4-Day Week", etc.

  @Prop()
  description: string;

  @Prop({ required: true })
  ruleType: string; // e.g. "Flexible", "Compressed", "Rotational"

  @Prop({ type: Object })
  parameters: Record<string, any>; // e.g. { maxHoursPerWeek: 40 }

  @Prop({ default: true })
  isActive: boolean;
}

export const CustomSchedulingRuleSchema = SchemaFactory.createForClass(CustomSchedulingRule);
export const CustomSchedulingRuleModel = model<CustomSchedulingRule>('CustomSchedulingRule', CustomSchedulingRuleSchema);
