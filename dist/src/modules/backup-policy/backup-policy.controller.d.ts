import { BackupPolicyService } from './backup-policy.service';
import { CreateBackupPolicyDto } from './dto/create-backup-policy.dto';
import { UpdateBackupPolicyDto } from './dto/update-backup-policy.dto';
import { BackupPolicyScheduler } from './backup-policy.scheduler';
export declare class BackupPolicyController {
    private readonly backupPolicyService;
    private readonly backupPolicyScheduler;
    constructor(backupPolicyService: BackupPolicyService, backupPolicyScheduler: BackupPolicyScheduler);
    create(dto: CreateBackupPolicyDto, user: any): Promise<{
        source: {
            id: number;
            name: string;
            dbName: string;
            host: string;
            port: number;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            isActive: boolean;
        };
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    findAll(): Promise<({
        source: {
            id: number;
            name: string;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
            isActive: boolean;
        };
    } & {
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    })[]>;
    listJobs(): Promise<{
        name: string;
        nextRun: string | null;
    }[]>;
    findOne(id: number): Promise<{
        source: {
            id: number;
            name: string;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    update(id: number, dto: UpdateBackupPolicyDto, user: any): Promise<{
        source: {
            id: number;
            name: string;
            dbName: string;
            host: string;
            port: number;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            isActive: boolean;
        };
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    toggleActive(id: number, user: any): Promise<{
        source: {
            id: number;
            name: string;
            dbName: string;
            host: string;
            port: number;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            isActive: boolean;
        };
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
}
