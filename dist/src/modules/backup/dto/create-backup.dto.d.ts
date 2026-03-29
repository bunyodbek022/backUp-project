import { BackupType } from '@prisma/client';
export declare class CreateBackupDto {
    sourceId: number;
    backupType?: BackupType;
    notes?: string;
}
