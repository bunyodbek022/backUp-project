import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BackupType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBackupPolicyDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sourceId: number;

  @ApiProperty({ example: 'Daily Studix Backup' })
  @IsString()
  policyName: string;

  @ApiProperty({ enum: BackupType, example: BackupType.FULL })
  @IsEnum(BackupType)
  backupType: BackupType;

  @ApiProperty({
    example: '0 2 * * *',
    description: 'cron expression',
  })
  @IsString()
  scheduleCron: string;

  @ApiPropertyOptional({ example: 7, default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  retentionDays?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxBackups?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}