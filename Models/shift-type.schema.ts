// shift-type.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ShiftType extends Document {
  @Prop({ required: true })
  name: string; // e.g. "Normal", "Night", "Split", "Rotational"

  @Prop({ required: true })
  startTime: string; // "09:00"

  @Prop({ required: true })
  endTime: string; // "17:00"

  @Prop({ default: 0 })
  gracePeriodMinutes: number;

  @Prop({ default: false })
  isRotational: boolean;

  @Prop({ type: [String], default: [] })
  applicableDepartments: string[];
}


export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftType);
