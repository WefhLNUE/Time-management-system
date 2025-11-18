// holiday-and-rest-day.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';

@Schema({ timestamps: true })
export class HolidayAndRestDay extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string; // e.g. "Eid Holiday", "Weekly Rest Day"

  @Prop({ default: false })
  isRecurring: boolean; // yearly recurrence

  @Prop({ default: false })
  isCompanyHoliday: boolean;
}

export const HolidayAndRestDaySchema = SchemaFactory.createForClass(HolidayAndRestDay);
export const HolidayAndRestDayModel = model<HolidayAndRestDay>('HolidayAndRestDay', HolidayAndRestDaySchema);
