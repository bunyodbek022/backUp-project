import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BackupStatus,
  BackupType,
  LogAction,
  LogLevel,
} from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBackup(backup: any) {
    return {
      ...backup,
      fileSize: backup.fileSize ? backup.fileSize.toString() : null,
    };
  }

  async createBackup(dto: CreateBackupDto, currentUser: any) {
    const source = await this.prisma.databaseSource.findUnique({
      where: { id: dto.sourceId },
    });

    if (!source) {
      throw new NotFoundException('Database source not found');
    }

    if (!source.isActive) {
      throw new BadRequestException('Database source is inactive');
    }

    if (source.dbType !== 'POSTGRESQL') {
      throw new BadRequestException('Only PostgreSQL is supported for now');
    }

    const startedAt = new Date();
    const timestamp = this.formatDate(startedAt);
    const fileName = `${source.dbName}_${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'storage', 'backups');
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backup = await this.prisma.backup.create({
      data: {
        sourceId: source.id,
        backupName: `${source.name} backup ${timestamp}`,
        fileName,
        backupType: dto.backupType ?? BackupType.FULL,
        filePath,
        status: BackupStatus.RUNNING,
        createdById: currentUser.id,
        notes: dto.notes ?? null,
      },
    });

    try {
      const command = [
        `PGPASSWORD="${source.password}"`,
        `pg_dump`,
        `-h "${source.host}"`,
        `-p "${source.port}"`,
        `-U "${source.username}"`,
        `-d "${source.dbName}"`,
        `-F p`,
        `> "${filePath}"`,
      ].join(' ');

      await execAsync(command, {
        env: {
          ...process.env,
          PGPASSWORD: source.password,
        },
        shell: '/bin/bash',
      });

      const stats = fs.statSync(filePath);
      const finishedAt = new Date();
      const durationSeconds = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 1000,
      );

      const updated = await this.prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: BackupStatus.SUCCESS,
          fileSize: BigInt(stats.size),
          finishedAt,
          durationSeconds,
        },
        include: {
          source: {
            select: {
              id: true,
              name: true,
              dbName: true,
              host: true,
              port: true,
              dbType: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      await this.prisma.systemLog.create({
        data: {
          level: LogLevel.INFO,
          action: LogAction.BACKUP_SUCCESS,
          message: `Backup created successfully for ${source.dbName}`,
          sourceId: source.id,
          userId: currentUser.id,
        },
      });

      return this.serializeBackup(updated);
    } catch (error: any) {
      const finishedAt = new Date();
      const durationSeconds = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 1000,
      );

      const failed = await this.prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: BackupStatus.FAILED,
          finishedAt,
          durationSeconds,
          errorMessage: error?.message || 'Backup failed',
        },
        include: {
          source: {
            select: {
              id: true,
              name: true,
              dbName: true,
              host: true,
              port: true,
              dbType: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      await this.prisma.systemLog.create({
        data: {
          level: LogLevel.ERROR,
          action: LogAction.BACKUP_FAILED,
          message: `Backup failed for ${source.dbName}: ${error?.message || 'Unknown error'}`,
          sourceId: source.id,
          userId: currentUser.id,
        },
      });

      return this.serializeBackup(failed);
    }
  }

  async findAll() {
    const backups = await this.prisma.backup.findMany({
      include: {
        source: {
          select: {
            id: true,
            name: true,
            dbName: true,
            host: true,
            port: true,
            dbType: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return backups.map((backup) => this.serializeBackup(backup));
  }

  async findOne(id: number) {
    const backup = await this.prisma.backup.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            dbName: true,
            host: true,
            port: true,
            dbType: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        restores: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    return this.serializeBackup(backup);
  }

  async getBackupFile(id: number) {
    const backup = await this.prisma.backup.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    let filePath = backup.filePath;

    // Check if file exists at stored path
    if (!filePath || !fs.existsSync(filePath)) {
      // Fallback: try to find it in the current storage/backups directory relative to process.cwd()
      const fallbackPath = path.join(process.cwd(), 'storage', 'backups', backup.fileName);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        throw new NotFoundException('Backup file not found on disk at stored path or fallback path');
      }
    }

    return { ...backup, filePath };
  }

  async remove(id: number, currentUser: any) {
    const backup = await this.prisma.backup.findUnique({
      where: { id },
      include: {
        restores: {
          select: { id: true },
        },
      },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.restores.length > 0) {
      throw new BadRequestException(
        'This backup cannot be deleted because it is linked to restore records',
      );
    }

    if (backup.filePath && fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    const deleted = await this.prisma.backup.delete({
      where: { id },
    });

    await this.prisma.systemLog.create({
      data: {
        level: LogLevel.INFO,
        action: LogAction.BACKUP_DELETE,
        message: `Backup deleted: ${deleted.backupName}`,
        sourceId: deleted.sourceId,
        userId: currentUser.id,
      },
    });

    return {
      message: 'Backup deleted successfully',
      id: deleted.id,
    };
  }

  async getStats() {
    const [totalBackups, successBackups, failedBackups, runningBackups, latestBackup] =
      await Promise.all([
        this.prisma.backup.count(),
        this.prisma.backup.count({
          where: { status: BackupStatus.SUCCESS },
        }),
        this.prisma.backup.count({
          where: { status: BackupStatus.FAILED },
        }),
        this.prisma.backup.count({
          where: { status: BackupStatus.RUNNING },
        }),
        this.prisma.backup.findFirst({
          orderBy: {
            startedAt: 'desc',
          },
          include: {
            source: {
              select: {
                id: true,
                name: true,
                dbName: true,
              },
            },
          },
        }),
      ]);

    return {
      totalBackups,
      successBackups,
      failedBackups,
      runningBackups,
      latestBackup: latestBackup ? this.serializeBackup(latestBackup) : null,
    };
  }

  private formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d}_${h}-${min}-${s}`;
  }
}