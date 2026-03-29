import PrismaService from 'src/Prisma/prisma.service';
import { CreateRestoreDto } from './dto/create-restore.dto';
export declare class RestoreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRestore(dto: CreateRestoreDto, currentUser: any): Promise<{
        backup: {
            id: number;
            backupName: string;
            fileName: string;
            filePath: string;
            status: import("@prisma/client").$Enums.BackupStatus;
            startedAt: Date;
            finishedAt: Date | null;
        } | null;
        source: {
            id: number;
            isActive: boolean;
            name: string;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
        };
        restoredBy: {
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: number;
        sourceId: number;
        notes: string | null;
        status: import("@prisma/client").$Enums.RestoreStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationSeconds: number | null;
        errorMessage: string | null;
        backupId: number | null;
        targetDbName: string;
        restoredById: number | null;
    }>;
    findAll(): Promise<({
        backup: {
            id: number;
            backupName: string;
            fileName: string;
            status: import("@prisma/client").$Enums.BackupStatus;
        } | null;
        source: {
            id: number;
            isActive: boolean;
            name: string;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
        };
        restoredBy: {
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: number;
        sourceId: number;
        notes: string | null;
        status: import("@prisma/client").$Enums.RestoreStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationSeconds: number | null;
        errorMessage: string | null;
        backupId: number | null;
        targetDbName: string;
        restoredById: number | null;
    })[]>;
    findOne(id: number): Promise<{
        backup: {
            id: number;
            notes: string | null;
            backupName: string;
            fileName: string;
            filePath: string;
            status: import("@prisma/client").$Enums.BackupStatus;
            startedAt: Date;
            finishedAt: Date | null;
        } | null;
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
        restoredBy: {
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: number;
        sourceId: number;
        notes: string | null;
        status: import("@prisma/client").$Enums.RestoreStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationSeconds: number | null;
        errorMessage: string | null;
        backupId: number | null;
        targetDbName: string;
        restoredById: number | null;
    }>;
}
