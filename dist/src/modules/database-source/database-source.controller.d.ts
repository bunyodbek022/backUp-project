import { DatabaseSourceService } from './database-source.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
export declare class DatabaseSourceController {
    private readonly databaseSourceService;
    constructor(databaseSourceService: DatabaseSourceService);
    create(dto: CreateDatabaseSourceDto): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }>;
    findAll(): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }>;
    update(id: number, dto: UpdateDatabaseSourceDto): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }>;
    toggleActive(id: number): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dbType: import("@prisma/client").$Enums.DatabaseType;
        host: string;
        port: number;
        dbName: string;
        username: string;
    }>;
}
