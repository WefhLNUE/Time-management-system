import { IsOptional, IsString, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { HolidayType } from '../Models/enums/index';

export class UpdateHolidayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
