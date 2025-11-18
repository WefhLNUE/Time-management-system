import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

export type AuditTrailDocument = AuditTrail & Document;

@Schema({ timestamps: true, collection: 'audit_trails' })
export class AuditTrail {
  @Prop({ required: true })
  entityName!: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId!: Types.ObjectId;

  @Prop({ type: String, enum: ['create', 'update', 'delete'], required: true })
  action!: 'create' | 'update' | 'delete';

  @Prop({ required: true })
  performedBy!: string;

  @Prop({ type: Date, default: Date.now })
  performedAt?: Date;

  @Prop({ type: Object })
  details?: Record<string, any>;
}

export const AuditTrailSchema = SchemaFactory.createForClass(AuditTrail);
export const AuditTrailModel = model<AuditTrail>('AuditTrail', AuditTrailSchema);
