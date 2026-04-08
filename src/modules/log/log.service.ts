import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { QueryLogDto } from './dto/query-log.dto';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryLogDto, user: any) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const baseWhere =
      user.role === UserRole.SUPERADMIN ? {} : { userId: user.id };

    const where: Prisma.SystemLogWhereInput = {
      ...baseWhere,
      ...(query.level && { level: query.level }),
      ...(query.action && { action: query.action }),
      ...(query.sourceId && { sourceId: query.sourceId }),
      ...(query.userId && { userId: query.userId }),
      ...(query.search && {
        OR: [
          {
            message: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [total, logs] = await this.prisma.$transaction([
      this.prisma.systemLog.count({ where }),
      this.prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
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
            },
          },
          user: {
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
      data: logs,
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
      user.role === UserRole.SUPERADMIN ? { id } : { id, userId: user.id };

    const log = await this.prisma.systemLog.findFirst({
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Log not found');
    }

    return log;
  }
}
