import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { HolidayType } from '../Models/enums/index';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(HolidayType)
  type: HolidayType;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
