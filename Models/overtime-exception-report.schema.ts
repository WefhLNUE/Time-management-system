// overtime-exception-report.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OvertimeExceptionReport extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  hoursWorked: number;

  @Prop({ required: true })
  approvedBy: string;

  @Prop({ default: false })
  exceptionFlag: boolean;

  @Prop()
  remarks: string;
}

export const OvertimeExceptionReportSchema = SchemaFactory.createForClass(OvertimeExceptionReport);
