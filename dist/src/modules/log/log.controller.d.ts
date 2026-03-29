import { LogService } from './log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    findAll(query: PaginationDto, user: any): Promise<{
        data: ({
            user: {
                id: number;
                email: string;
                fullName: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
            source: {
                id: number;
                isActive: boolean;
                name: string;
                dbType: import("@prisma/client").$Enums.DatabaseType;
                host: string;
                port: number;
                dbName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            sourceId: number | null;
            userId: number | null;
            level: import("@prisma/client").$Enums.LogLevel;
            action: import("@prisma/client").$Enums.LogAction | null;
            message: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            lastPage: number;
        };
    }>;
    findOne(id: number, user: any): Promise<{
        user: {
            id: number;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        } | null;
    } & {
        id: number;
        createdAt: Date;
        sourceId: number | null;
        userId: number | null;
        level: import("@prisma/client").$Enums.LogLevel;
        action: import("@prisma/client").$Enums.LogAction | null;
        message: string;
    }>;
}
