import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PunchesService } from '../services/punches.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance/punches')
export class PunchesController {
    constructor(private readonly svc: PunchesService) {}

    /**
     * HR / System Admin – Audit view
     */
    @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
    @Get()
    async getAllPunches() {
        const punches = await this.svc.getAllPunches();
        return punches; // 🔴 THIS WAS THE MISSING PIECE
    }

    /**
     * Manual punch
     */
    @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
    @Post()
    async addPunch(
        @Body()
        body: {
            employeeId: string;
            timestamp: string;
            type?: 'IN' | 'OUT';
        },
    ) {
        return this.svc.createManualPunch(body);
    }
}
