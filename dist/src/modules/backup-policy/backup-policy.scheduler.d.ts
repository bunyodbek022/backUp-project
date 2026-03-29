import { OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import PrismaService from 'src/Prisma/prisma.service';
import { BackupService } from '../backup/backup.service';
export declare class BackupPolicyScheduler implements OnModuleInit {
    private readonly schedulerRegistry;
    private readonly prisma;
    private readonly backupService;
    private readonly logger;
    constructor(schedulerRegistry: SchedulerRegistry, prisma: PrismaService, backupService: BackupService);
    onModuleInit(): Promise<void>;
    syncAllPolicies(): Promise<void>;
    registerPolicyJob(policy: {
        id: number;
        sourceId: number;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
        backupType: any;
        isActive: boolean;
    }): void;
    removePolicyJob(policyId: number): void;
    listJobs(): Promise<{
        name: string;
        nextRun: string | null;
    }[]>;
    private getJobName;
    private applyRetention;
}
