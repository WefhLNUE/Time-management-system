import { Test, TestingModule } from '@nestjs/testing';
import { OvertimeService } from './overtime.service';
import { ExceptionsService } from './exceptions.service';
import { getModelToken } from '@nestjs/mongoose';

describe('OvertimeService', () => {
    let service: OvertimeService;
    let exceptionsService: ExceptionsService;

    const mockModel = {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockExceptionsService = {
        createException: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OvertimeService,
                {
                    provide: getModelToken('AttendanceRecord'),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken('OvertimeRule'),
                    useValue: mockModel,
                },
                {
                    provide: ExceptionsService,
                    useValue: mockExceptionsService,
                },
            ],
        }).compile();

        service = module.get<OvertimeService>(OvertimeService);
        exceptionsService = module.get<ExceptionsService>(ExceptionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create request', async () => {
        mockModel.findOne.mockResolvedValue({ active: true });
        mockModel.findById.mockResolvedValue({ finalisedForPayroll: true, save: jest.fn() });

        const result = await service.createRequest({ attendanceRecordId: '123' } as any);
        expect(result.requestId).toBe('pending');
    });
});

