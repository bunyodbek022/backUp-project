import { PartialType } from '@nestjs/swagger';
import { CreateBackupPolicyDto } from './create-backup-policy.dto';

export class UpdateBackupPolicyDto extends PartialType(CreateBackupPolicyDto) {}
