import type { Response } from 'express';
import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    create(dto: CreateBackupDto, user: any): Promise<any>;
    findAll(): Promise<any[]>;
    getStats(): Promise<{
        totalBackups: number;
        successBackups: number;
        failedBackups: number;
        runningBackups: number;
        latestBackup: any;
    }>;
    download(id: number, res: Response): Promise<void>;
    findOne(id: number): Promise<any>;
    remove(id: number, user: any): Promise<{
        message: string;
        id: number;
    }>;
}
