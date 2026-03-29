import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LogAction,
  LogLevel,
  RestoreStatus,
} from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateRestoreDto } from './dto/create-restore.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  async createRestore(dto: CreateRestoreDto, currentUser: any) {
    const backup = await this.prisma.backup.findUnique({
      where: { id: dto.backupId },
      include: {
        source: true,
      },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== 'SUCCESS') {
      throw new BadRequestException('Only successful backups can be restored');
    }

    if (!backup.source) {
      throw new NotFoundException('Database source not found for this backup');
    }

    const source = backup.source;

    if (!source.isActive) {
      throw new BadRequestException('Database source is inactive');
    }

    if (source.dbType !== 'POSTGRESQL') {
      throw new BadRequestException('Only PostgreSQL is supported for now');
    }

    if (!backup.filePath || !fs.existsSync(backup.filePath)) {
      throw new BadRequestException('Backup file not found on disk');
    }

    const startedAt = new Date();

    const restore = await this.prisma.restore.create({
      data: {
        backupId: backup.id,
        sourceId: source.id,
        targetDbName: source.dbName,
        status: RestoreStatus.RUNNING,
        restoredById: currentUser.id,
        notes: dto.notes ?? null,
      },
    });

    try {
      const command = [
        `PGPASSWORD="${source.password}"`,
        `psql`,
        `-h "${source.host}"`,
        `-p "${source.port}"`,
        `-U "${source.username}"`,
        `-d "${source.dbName}"`,
        `< "${backup.filePath}"`,
      ].join(' ');

      await execAsync(command, {
        env: {
          ...process.env,
          PGPASSWORD: source.password,
        },
        shell: '/bin/bash',
      });

      const finishedAt = new Date();
      const durationSeconds = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 1000,
      );

      const updated = await this.prisma.restore.update({
        where: { id: restore.id },
        data: {
          status: RestoreStatus.SUCCESS,
          finishedAt,
          durationSeconds,
        },
        include: {
          backup: {
            select: {
              id: true,
              backupName: true,
              fileName: true,
              filePath: true,
              status: true,
              startedAt: true,
              finishedAt: true,
            },
          },
          source: {
            select: {
              id: true,
              name: true,
              dbName: true,
              host: true,
              port: true,
              dbType: true,
              isActive: true,
            },
          },
          restoredBy: {
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
          action: LogAction.RESTORE_SUCCESS,
          message: `Restore completed successfully for ${source.dbName}`,
          sourceId: source.id,
          userId: currentUser.id,
        },
      });

      return updated;
    } catch (error: any) {
      const finishedAt = new Date();
      const durationSeconds = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 1000,
      );

      const failed = await this.prisma.restore.update({
        where: { id: restore.id },
        data: {
          status: RestoreStatus.FAILED,
          finishedAt,
          durationSeconds,
          errorMessage: error?.message || 'Restore failed',
        },
        include: {
          backup: {
            select: {
              id: true,
              backupName: true,
              fileName: true,
              filePath: true,
              status: true,
              startedAt: true,
              finishedAt: true,
            },
          },
          source: {
            select: {
              id: true,
              name: true,
              dbName: true,
              host: true,
              port: true,
              dbType: true,
              isActive: true,
            },
          },
          restoredBy: {
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
          action: LogAction.RESTORE_FAILED,
          message: `Restore failed for ${source.dbName}: ${error?.message || 'Unknown error'}`,
          sourceId: source.id,
          userId: currentUser.id,
        },
      });

      return failed;
    }
  }

  async findAll() {
    return this.prisma.restore.findMany({
      orderBy: {
        id: 'desc',
      },
      include: {
        backup: {
          select: {
            id: true,
            backupName: true,
            fileName: true,
            status: true,
          },
        },
        source: {
          select: {
            id: true,
            name: true,
            dbName: true,
            host: true,
            port: true,
            dbType: true,
            isActive: true,
          },
        },
        restoredBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const restore = await this.prisma.restore.findUnique({
      where: { id },
      include: {
        backup: {
          select: {
            id: true,
            backupName: true,
            fileName: true,
            filePath: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            notes: true,
          },
        },
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
        restoredBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!restore) {
      throw new NotFoundException('Restore not found');
    }

    return restore;
  }
}