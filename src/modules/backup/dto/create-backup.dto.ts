import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BackupType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBackupDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  sourceId: number;

  @ApiPropertyOptional({ enum: BackupType, example: BackupType.FULL })
  @IsOptional()
  @IsEnum(BackupType)
  backupType?: BackupType;

  @ApiPropertyOptional({ example: 'manual backup before deploy' })
  @IsOptional()
  @IsString()
  notes?: string;
}