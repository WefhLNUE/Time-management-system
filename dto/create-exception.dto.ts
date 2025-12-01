import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum TimeExceptionType {
  CORRECTION = 'CORRECTION',
  OVERTIME = 'OVERTIME',
  PERMISSION = 'PERMISSION',
}

export class CreateExceptionDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  attendanceRecordId?: string;

  @IsNotEmpty()
  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string; // manager id

  @IsOptional()
  @IsString()
  details?: string;
}
