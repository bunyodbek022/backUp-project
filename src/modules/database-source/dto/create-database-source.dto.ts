import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DatabaseType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDatabaseSourceDto {
  @ApiProperty({ example: 'Studix Production DB' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: DatabaseType, example: DatabaseType.POSTGRESQL })
  @IsEnum(DatabaseType)
  dbType: DatabaseType;

  @ApiProperty({ example: '127.0.0.1' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ example: 5432 })
  @IsInt()
  @Min(1)
  port: number;

  @ApiProperty({ example: 'studix_db' })
  @IsString()
  @IsNotEmpty()
  dbName: string;

  @ApiProperty({ example: 'postgres' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
