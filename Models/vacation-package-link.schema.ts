// vacation-package-link.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, model } from 'mongoose';

@Schema({ timestamps: true })
export class VacationPackageLink extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'VacationPackage', required: true })
  packageId: Types.ObjectId;

  @Prop({ required: true })
  effectiveFrom: Date;

  @Prop({ required: true })
  effectiveTo: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const VacationPackageLinkSchema = SchemaFactory.createForClass(VacationPackageLink);
export const VacationPackageLinkModel = model<VacationPackageLink>('VacationPackageLink', VacationPackageLinkSchema);