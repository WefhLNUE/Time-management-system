import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateOvertimeStatusDto {
    @IsNotEmpty()
    @IsEnum(['APPROVED', 'REJECTED'])
    status: string;

    @IsNotEmpty()
    @IsString()
    employeeId: string;

    @IsNotEmpty()
    @IsString()
    attendanceRecordId: string;

    @IsOptional()
    @IsString()
    managerComment?: string;
}
