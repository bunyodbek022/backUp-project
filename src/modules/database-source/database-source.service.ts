import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
import { encrypt } from '../../utils/encryption.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DatabaseSourceService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeSource(source: any) {
    if (source && source.password) {
      source.password = '********';
    }
    return source;
  }

  async create(dto: CreateDatabaseSourceDto, user: any) {
    const source = await this.prisma.databaseSource.create({
      data: {
        name: dto.name,
        dbType: dto.dbType,
        host: dto.host,
        port: dto.port,
        dbName: dto.dbName,
        username: dto.username,
        password: encrypt(dto.password),
        isActive: dto.isActive ?? true,
        userId: user.id,
      },
    });
    return this.sanitizeSource(source);
  }

  async findAll(query: PaginationDto, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const baseWhere = user.role === UserRole.SUPERADMIN ? {} : { userId: user.id };
    const searchWhere = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { host: { contains: search, mode: 'insensitive' } },
            { dbName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const where: any = { ...baseWhere, ...searchWhere };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.databaseSource.count({ where }),
      this.prisma.databaseSource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    const sanitizedData = data.map((s) => this.sanitizeSource(s));

    return {
      data: sanitizedData,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: any) {
    const whereCondition = user.role === UserRole.SUPERADMIN ? { id } : { id, userId: user.id };
    const source = await this.prisma.databaseSource.findFirst({
      where: whereCondition,
    });

    if (!source) {
      throw new NotFoundException('Database source not found');
    }

    return this.sanitizeSource(source);
  }

  async update(id: number, dto: UpdateDatabaseSourceDto, user: any) {
    await this.findOne(id, user); // Validates existence and ownership

    const updateData = { ...dto };
    if (updateData.password === '********') {
      delete updateData.password;
    } else if (updateData.password) {
      updateData.password = encrypt(updateData.password);
    }

    const source = await this.prisma.databaseSource.update({
      where: { id },
      data: updateData,
    });
    return this.sanitizeSource(source);
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user); // Validates existence and ownership

    // Clear sourceId from SystemLogs to avoid foreign key constraint error when deleting source
    await this.prisma.systemLog.updateMany({
      where: { sourceId: id },
      data: { sourceId: null },
    });

    return this.prisma.databaseSource.delete({
      where: { id },
    });
  }

  async toggleActive(id: number, user: any) {
    const source = await this.findOne(id, user); // Validates existence and ownership

    return this.prisma.databaseSource.update({
      where: { id },
      data: {
        isActive: !source.isActive,
      },
    });
  }
}