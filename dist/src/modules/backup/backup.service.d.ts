import PrismaService from 'src/Prisma/prisma.service';
import { CreateBackupDto } from './dto/create-backup.dto';
export declare class BackupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private serializeBackup;
    createBackup(dto: CreateBackupDto, currentUser: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    getBackupFile(id: number): Promise<{
        filePath: string;
        id: number;
        sourceId: number;
        backupName: string;
        fileName: string;
        backupType: import("@prisma/client").$Enums.BackupType;
        fileSize: bigint | null;
        status: import("@prisma/client").$Enums.BackupStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationSeconds: number | null;
        checksum: string | null;
        storageType: import("@prisma/client").$Enums.StorageType;
        createdById: number | null;
        notes: string | null;
        errorMessage: string | null;
    }>;
    remove(id: number, currentUser: any): Promise<{
        message: string;
        id: number;
    }>;
    getStats(): Promise<{
        totalBackups: number;
        successBackups: number;
        failedBackups: number;
        runningBackups: number;
        latestBackup: any;
    }>;
    private formatDate;
}
