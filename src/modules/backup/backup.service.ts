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
  UserRole,
} from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { decrypt } from '../../utils/encryption.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

const execFileAsync = promisify(execFile);

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
    const sourceWhere = currentUser.role === UserRole.SUPERADMIN
      ? { id: dto.sourceId }
      : { id: dto.sourceId, userId: currentUser.id };

    const source = await this.prisma.databaseSource.findFirst({
      where: sourceWhere,
    });

    if (!source) {
      throw new NotFoundException('Database source not found or access denied');
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
      const decryptedPassword = decrypt(source.password);

      const args = [
        '-h', source.host,
        '-p', source.port.toString(),
        '-U', source.username,
        '-d', source.dbName,
        '-F', 'p',
        '-f', filePath
      ];

      await execFileAsync('pg_dump', args, {
        env: {
          ...process.env,
          PGPASSWORD: decryptedPassword,
        },
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

  async findAll(query: PaginationDto, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const baseWhere = user.role === UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
    const searchWhere = search
      ? { backupName: { contains: search, mode: 'insensitive' } }
      : {};

    const where: any = { ...baseWhere, ...searchWhere };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.backup.count({ where }),
      this.prisma.backup.findMany({
        where,
        skip,
        take: limit,
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
      }),
    ]);

    return {
      data: data.map((backup) => this.serializeBackup(backup)),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: any) {
    const baseWhere = user.role === UserRole.SUPERADMIN ? { id } : { id, source: { userId: user.id } };

    const backup = await this.prisma.backup.findFirst({
      where: baseWhere,
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

  async getBackupFile(id: number, user: any) {
    const baseWhere = user.role === UserRole.SUPERADMIN ? { id } : { id, source: { userId: user.id } };

    const backup = await this.prisma.backup.findFirst({
      where: baseWhere,
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
    const baseWhere = currentUser.role === UserRole.SUPERADMIN ? { id } : { id, source: { userId: currentUser.id } };

    const backup = await this.prisma.backup.findFirst({
      where: baseWhere,
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

  async getStats(user: any) {
    const baseWhere = user.role === UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };

    const [totalBackups, successBackups, failedBackups, runningBackups, latestBackup] =
      await Promise.all([
        this.prisma.backup.count({ where: baseWhere }),
        this.prisma.backup.count({
          where: { status: BackupStatus.SUCCESS, ...baseWhere },
        }),
        this.prisma.backup.count({
          where: { status: BackupStatus.FAILED, ...baseWhere },
        }),
        this.prisma.backup.count({
          where: { status: BackupStatus.RUNNING, ...baseWhere },
        }),
        this.prisma.backup.findFirst({
          where: baseWhere,
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