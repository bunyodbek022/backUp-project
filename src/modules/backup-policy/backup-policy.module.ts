import { Module } from '@nestjs/common';
import { BackupPolicyService } from './backup-policy.service';
import { BackupPolicyController } from './backup-policy.controller';
import { BackupPolicyScheduler } from './backup-policy.scheduler';
import { BackupService } from '../backup/backup.service';

@Module({
  controllers: [BackupPolicyController],
  providers: [BackupPolicyService, BackupPolicyScheduler, BackupService],
})
export class BackupPolicyModule {}
