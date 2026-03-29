import { LogAction, LogLevel } from '@prisma/client';
export declare class QueryLogDto {
    level?: LogLevel;
    action?: LogAction;
    sourceId?: number;
    userId?: number;
    search?: string;
    page?: number;
    limit?: number;
}
