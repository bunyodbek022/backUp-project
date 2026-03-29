import { BackupPolicyService } from './backup-policy.service';
import { CreateBackupPolicyDto } from './dto/create-backup-policy.dto';
import { UpdateBackupPolicyDto } from './dto/update-backup-policy.dto';
import { BackupPolicyScheduler } from './backup-policy.scheduler';
import { PaginationDto } from '../../common/dto/pagination.dto';
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    findAll(query: PaginationDto, user: any): Promise<{
        data: ({
            source: {
                id: number;
                isActive: boolean;
                name: string;
                dbType: import("@prisma/client").$Enums.DatabaseType;
                host: string;
                port: number;
                dbName: string;
            };
        } & {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            sourceId: number;
            backupType: import("@prisma/client").$Enums.BackupType;
            policyName: string;
            scheduleCron: string;
            retentionDays: number;
            maxBackups: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            lastPage: number;
        };
    }>;
    listJobs(): Promise<{
        name: string;
        nextRun: string | null;
    }[]>;
    findOne(id: number, user: any): Promise<{
        source: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
        };
    } & {
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
    remove(id: number, user: any): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        policyName: string;
        scheduleCron: string;
        retentionDays: number;
        maxBackups: number | null;
    }>;
}
