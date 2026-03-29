import PrismaService from 'src/Prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SuperadminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: {
            total: number;
            active: number;
            trialing: number;
            inactive: number;
        };
        financials: {
            estimatedMonthlyRevenue: number;
            currency: string;
        };
        system: {
            totalBackups: number;
            totalDatabaseSources: number;
        };
    }>;
    getSystemLogs(): Promise<({
        user: {
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        level: import("@prisma/client").$Enums.LogLevel;
        action: import("@prisma/client").$Enums.LogAction | null;
        message: string;
        sourceId: number | null;
        userId: number | null;
    })[]>;
    getUsers(query: PaginationDto): Promise<{
        data: ({
            plan: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                price: import("@prisma/client/runtime/client").Decimal;
                currency: string;
                interval: string;
                features: string[];
                stripePriceId: string | null;
            } | null;
        } & {
            subscriptionStatus: string | null;
            id: number;
            fullName: string;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            trialEndsAt: Date | null;
            stripeCustomerId: string | null;
            planId: number | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getBackups(query: PaginationDto): Promise<{
        data: ({
            source: {
                id: number;
                password: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                userId: number;
                dbType: import("@prisma/client").$Enums.DatabaseType;
                host: string;
                port: number;
                dbName: string;
                username: string;
            };
            createdBy: {
                fullName: string;
                email: string;
            } | null;
        } & {
            id: number;
            sourceId: number;
            backupName: string;
            fileName: string;
            backupType: import("@prisma/client").$Enums.BackupType;
            filePath: string;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDatabases(query: PaginationDto): Promise<{
        data: ({
            user: {
                fullName: string;
                email: string;
            };
        } & {
            id: number;
            password: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            dbType: import("@prisma/client").$Enums.DatabaseType;
            host: string;
            port: number;
            dbName: string;
            username: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getRevenueChart(): Promise<{
        name: string;
        revenue: number;
    }[]>;
}
