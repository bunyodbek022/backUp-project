import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRestoreDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  backupId: number;

  @ApiPropertyOptional({ example: 'manual restore before testing' })
  @IsOptional()
  @IsString()
  notes?: string;
}
