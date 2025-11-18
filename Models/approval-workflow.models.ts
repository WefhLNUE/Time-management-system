import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

export type ApprovalWorkflowDocument = ApprovalWorkflow & Document;

@Schema({ timestamps: true, collection: 'approval_workflows' })
export class ApprovalWorkflow {
  @Prop({ type: Types.ObjectId, ref: 'TimeExceptionRequest', required: true })
  requestId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  approverId!: Types.ObjectId;

  @Prop({ type: String, enum: ['approved', 'rejected', 'escalated'], required: true })
  action!: 'approved' | 'rejected' | 'escalated';

  @Prop({ type: String, maxlength: 400 })
  remarks?: string;

  @Prop({ type: Date, required: true })
  actionDate!: Date;
}

export const ApprovalWorkflowSchema = SchemaFactory.createForClass(ApprovalWorkflow);
export const ApprovalWorkflowModel = model<ApprovalWorkflow>('ApprovalWorkflow', ApprovalWorkflowSchema);
