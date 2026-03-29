import type { Response } from 'express';
import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    create(dto: CreateBackupDto, user: any): Promise<any>;
    findAll(query: PaginationDto, user: any): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            lastPage: number;
        };
    }>;
    getStats(user: any): Promise<{
        totalBackups: number;
        successBackups: number;
        failedBackups: number;
        runningBackups: number;
        latestBackup: any;
    }>;
    download(id: number, res: Response, user: any): Promise<void>;
    findOne(id: number, user: any): Promise<any>;
    remove(id: number, user: any): Promise<{
        message: string;
        id: number;
    }>;
}
