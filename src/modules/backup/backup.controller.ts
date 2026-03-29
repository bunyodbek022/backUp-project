import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @ApiOperation({ summary: 'Create a new backup' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  create(@Body() dto: CreateBackupDto, @CurrentUser() user: any) {
    return this.backupService.createBackup(dto, user);
  }

  @ApiOperation({ summary: 'Get all backups' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get()
  findAll() {
    return this.backupService.findAll();
  }

  @ApiOperation({ summary: 'Get backup statistics' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get('stats/overview')
  getStats() {
    return this.backupService.getStats();
  }

  @ApiOperation({ summary: 'Download backup file by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const backup = await this.backupService.getBackupFile(id);
    return res.download(backup.filePath, backup.fileName);
  }

  @ApiOperation({ summary: 'Get backup by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.backupService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete backup by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.backupService.remove(id, user);
  }
}