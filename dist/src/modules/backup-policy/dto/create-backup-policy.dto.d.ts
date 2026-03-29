import { BackupType } from '@prisma/client';
export declare class CreateBackupPolicyDto {
    sourceId: number;
    policyName: string;
    backupType: BackupType;
    scheduleCron: string;
    retentionDays?: number;
    maxBackups?: number;
    isActive?: boolean;
}
