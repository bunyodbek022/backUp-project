import PrismaService from 'src/Prisma/prisma.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class DatabaseSourceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private sanitizeSource;
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
}
