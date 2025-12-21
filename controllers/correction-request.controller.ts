import {
    Body,
    Controller,
    Post,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { CorrectionRequestDto } from '../dto/correction-request.dto';
import { CorrectionRequestService } from '../services/correction-request.service';

type AuthUser = {
    id: string;
    roles: string[];
    employeeNumber: string;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/correction-request')
export class CorrectionRequestController {
    constructor(private readonly svc: CorrectionRequestService) {}

    /**
     * EMPLOYEE / HR ADMIN / SYSTEM ADMIN
     * submit correction request
     */
    @Roles(
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN,
    )
    @Post()
    async create(
        @Body() dto: CorrectionRequestDto,
        @Req() req: Request,
    ) {
        const user = req.user as AuthUser;

        /**
         * EMPLOYEE: can submit only for self
         * HR / SYSTEM: allowed to submit for any employee
         */
        if (
            user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
            dto.employeeId !== user.id
        ) {
            throw new ForbiddenException('Employee mismatch');
        }

        return this.svc.create(dto);
    }
}
