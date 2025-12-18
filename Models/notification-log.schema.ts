// src/time-management/Models/notification-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

@Schema({ timestamps: true })
export class NotificationLog {
    @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: false })
    to?: Types.ObjectId | null;

    @Prop({ required: true })
    type: string;

    @Prop()
    message?: string;

}

export const NotificationLogSchema =
    SchemaFactory.createForClass(NotificationLog);
