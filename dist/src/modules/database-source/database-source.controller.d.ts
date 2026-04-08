import { PaginationDto } from '../../common/dto/pagination.dto';
import { DatabaseSourceService } from './database-source.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
export declare class DatabaseSourceController {
    private readonly databaseSourceService;
    constructor(databaseSourceService: DatabaseSourceService);
    create(dto: CreateDatabaseSourceDto, user: any): Promise<any>;
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
    update(id: number, dto: UpdateDatabaseSourceDto, user: any): Promise<any>;
    toggleActive(id: number, user: any): Promise<{
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
    }>;
    remove(id: number, user: any): Promise<{
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
    }>;
    testConnection(id: number, user: any): Promise<{
        success: boolean;
        message: any;
    }>;
    getTables(id: number, user: any): Promise<string[]>;
    getTableData(id: number, tableName: string, limit: string, offset: string, user: any): Promise<{
        columns: any;
        rows: any;
        total: number;
    }>;
}
