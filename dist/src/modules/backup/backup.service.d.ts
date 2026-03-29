import PrismaService from 'src/Prisma/prisma.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class BackupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private serializeBackup;
    createBackup(dto: CreateBackupDto, currentUser: any): Promise<any>;
    findAll(query: PaginationDto, user: any): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            lastPage: number;
        };
    }>;
    findOne(id: number, user: any): Promise<any>;
    getBackupFile(id: number, user: any): Promise<{
        filePath: string;
        id: number;
        sourceId: number;
        backupType: import("@prisma/client").$Enums.BackupType;
        notes: string | null;
        backupName: string;
        fileName: string;
        fileSize: bigint | null;
        status: import("@prisma/client").$Enums.BackupStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationSeconds: number | null;
        checksum: string | null;
        storageType: import("@prisma/client").$Enums.StorageType;
        errorMessage: string | null;
        createdById: number | null;
    }>;
    remove(id: number, currentUser: any): Promise<{
        message: string;
        id: number;
    }>;
    getStats(user: any): Promise<{
        totalBackups: number;
        successBackups: number;
        failedBackups: number;
        runningBackups: number;
        latestBackup: any;
    }>;
    private formatDate;
}
