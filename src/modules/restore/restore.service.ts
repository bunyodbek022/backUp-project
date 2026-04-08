import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LogAction, LogLevel, RestoreStatus, UserRole } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateRestoreDto } from './dto/create-restore.dto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { decrypt } from '../../utils/encryption.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

const execFileAsync = promisify(execFile);

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

    if (
      currentUser.role !== UserRole.SUPERADMIN &&
      backup.source.userId !== currentUser.id
    ) {
      throw new NotFoundException(
        'Backup or database source not found or access denied',
      );
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
      const decryptedPassword = decrypt(source.password);

      const args = [
        '-h',
        source.host,
        '-p',
        source.port.toString(),
        '-U',
        source.username,
        '-d',
        source.dbName,
        '-f',
        backup.filePath,
        '-v',
        'ON_ERROR_STOP=1',
      ];

      await execFileAsync('psql', args, {
        env: {
          ...process.env,
          PGPASSWORD: decryptedPassword,
        },
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

  async findAll(query: PaginationDto, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const baseWhere =
      user.role === UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
    const searchWhere = search
      ? { targetDbName: { contains: search, mode: 'insensitive' } }
      : {};

    const where: any = { ...baseWhere, ...searchWhere };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.restore.count({ where }),
      this.prisma.restore.findMany({
        where,
        skip,
        take: limit,
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
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: any) {
    const baseWhere =
      user.role === UserRole.SUPERADMIN
        ? { id }
        : { id, source: { userId: user.id } };

    const restore = await this.prisma.restore.findFirst({
      where: baseWhere,
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
