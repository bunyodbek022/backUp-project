import { DatabaseType } from '@prisma/client';
export declare class CreateDatabaseSourceDto {
    name: string;
    dbType: DatabaseType;
    host: string;
    port: number;
    dbName: string;
    username: string;
    password: string;
    isActive?: boolean;
}
