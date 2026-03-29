import { SuperadminService } from './superadmin.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SuperadminController {
    private readonly superadminService;
    constructor(superadminService: SuperadminService);
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
    getLogs(): Promise<({
        user: {
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        sourceId: number | null;
        userId: number | null;
        level: import("@prisma/client").$Enums.LogLevel;
        action: import("@prisma/client").$Enums.LogAction | null;
        message: string;
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
            id: number;
            email: string;
            fullName: string;
            password: string;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            trialEndsAt: Date | null;
            subscriptionStatus: string | null;
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
            createdBy: {
                email: string;
                fullName: string;
            } | null;
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
        } & {
            id: number;
            sourceId: number;
            backupType: import("@prisma/client").$Enums.BackupType;
            notes: string | null;
            backupName: string;
            fileName: string;
            filePath: string;
            fileSize: bigint | null;
            status: import("@prisma/client").$Enums.BackupStatus;
            startedAt: Date;
            finishedAt: Date | null;
            durationSeconds: number | null;
            checksum: string | null;
            storageType: import("@prisma/client").$Enums.StorageType;
            errorMessage: string | null;
            createdById: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDatabases(query: PaginationDto): Promise<{
        data: ({
            user: {
                email: string;
                fullName: string;
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
