import { Injectable, NotFoundException } from '@nestjs/common';
import { LogAction, LogLevel, UserRole } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateBackupPolicyDto } from './dto/create-backup-policy.dto';
import { UpdateBackupPolicyDto } from './dto/update-backup-policy.dto';
import { BackupPolicyScheduler } from './backup-policy.scheduler';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BackupPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly backupPolicyScheduler: BackupPolicyScheduler,
  ) {}

  async create(dto: CreateBackupPolicyDto, currentUser: any) {
    const sourceWhere =
      currentUser.role === UserRole.SUPERADMIN
        ? { id: dto.sourceId }
        : { id: dto.sourceId, userId: currentUser.id };

    const source = await this.prisma.databaseSource.findFirst({
      where: sourceWhere,
    });

    if (!source) {
      throw new NotFoundException('Database source not found or access denied');
    }

    const policy = await this.prisma.backupPolicy.create({
      data: {
        sourceId: dto.sourceId,
        policyName: dto.policyName,
        backupType: dto.backupType,
        scheduleCron: dto.scheduleCron,
        retentionDays: dto.retentionDays ?? 7,
        maxBackups: dto.maxBackups ?? null,
        isActive: dto.isActive ?? true,
      },
      include: {
        source: true,
      },
    });

    if (policy.isActive && policy.source.isActive) {
      this.backupPolicyScheduler.registerPolicyJob(policy);
    }

    await this.prisma.systemLog.create({
      data: {
        level: LogLevel.INFO,
        action: LogAction.POLICY_CREATE,
        message: `Backup policy created: ${policy.policyName}`,
        sourceId: policy.sourceId,
        userId: currentUser.id,
      },
    });

    return {
      ...policy,
      source: {
        id: policy.source.id,
        name: policy.source.name,
        dbName: policy.source.dbName,
        host: policy.source.host,
        port: policy.source.port,
        dbType: policy.source.dbType,
        isActive: policy.source.isActive,
      },
    };
  }

  async findAll(query: PaginationDto, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const baseWhere =
      user.role === UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
    const searchWhere = search
      ? { policyName: { contains: search, mode: 'insensitive' } }
      : {};

    const where: any = { ...baseWhere, ...searchWhere };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.backupPolicy.count({ where }),
      this.prisma.backupPolicy.findMany({
        where,
        skip,
        take: limit,
        include: {
          source: {
            select: {
              id: true,
              name: true,
              dbName: true,
              dbType: true,
              host: true,
              port: true,
              isActive: true,
            },
          },
        },
        orderBy: { id: 'desc' },
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

    const policy = await this.prisma.backupPolicy.findFirst({
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
      },
    });

    if (!policy) {
      throw new NotFoundException('Backup policy not found');
    }

    return policy;
  }

  async update(id: number, dto: UpdateBackupPolicyDto, currentUser: any) {
    await this.findOne(id, currentUser);

    if (dto.sourceId) {
      const sourceWhere =
        currentUser.role === UserRole.SUPERADMIN
          ? { id: dto.sourceId }
          : { id: dto.sourceId, userId: currentUser.id };

      const source = await this.prisma.databaseSource.findFirst({
        where: sourceWhere,
      });

      if (!source) {
        throw new NotFoundException('Database source not found');
      }
    }

    const updated = await this.prisma.backupPolicy.update({
      where: { id },
      data: dto,
      include: {
        source: true,
      },
    });

    this.backupPolicyScheduler.removePolicyJob(updated.id);

    if (updated.isActive && updated.source.isActive) {
      this.backupPolicyScheduler.registerPolicyJob(updated);
    }

    await this.prisma.systemLog.create({
      data: {
        level: LogLevel.INFO,
        action: LogAction.POLICY_UPDATE,
        message: `Backup policy updated: ${updated.policyName}`,
        sourceId: updated.sourceId,
        userId: currentUser.id,
      },
    });

    return {
      ...updated,
      source: {
        id: updated.source.id,
        name: updated.source.name,
        dbName: updated.source.dbName,
        host: updated.source.host,
        port: updated.source.port,
        dbType: updated.source.dbType,
        isActive: updated.source.isActive,
      },
    };
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user);

    this.backupPolicyScheduler.removePolicyJob(id);

    return this.prisma.backupPolicy.delete({
      where: { id },
    });
  }

  async toggleActive(id: number, currentUser: any) {
    const policy = await this.findOne(id, currentUser);

    const updated = await this.prisma.backupPolicy.update({
      where: { id },
      data: {
        isActive: !policy.isActive,
      },
      include: {
        source: true,
      },
    });

    this.backupPolicyScheduler.removePolicyJob(updated.id);

    if (updated.isActive && updated.source.isActive) {
      this.backupPolicyScheduler.registerPolicyJob(updated);
    }

    await this.prisma.systemLog.create({
      data: {
        level: LogLevel.INFO,
        action: LogAction.POLICY_UPDATE,
        message: `Backup policy ${updated.isActive ? 'enabled' : 'disabled'}: ${updated.policyName}`,
        sourceId: updated.sourceId,
        userId: currentUser.id,
      },
    });

    return {
      ...updated,
      source: {
        id: updated.source.id,
        name: updated.source.name,
        dbName: updated.source.dbName,
        host: updated.source.host,
        port: updated.source.port,
        dbType: updated.source.dbType,
        isActive: updated.source.isActive,
      },
    };
  }
}
