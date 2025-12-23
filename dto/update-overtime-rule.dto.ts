import { PartialType } from '@nestjs/mapped-types';
import { CreateOvertimeRuleDto } from './create-overtime-rule.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOvertimeRuleDto extends PartialType(CreateOvertimeRuleDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
