// src/modules/database-source/database-source.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';

@Injectable()
export class DatabaseSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDatabaseSourceDto) {
    return this.prisma.databaseSource.create({
      data: {
        name: dto.name,
        dbType: dto.dbType,
        host: dto.host,
        port: dto.port,
        dbName: dto.dbName,
        username: dto.username,
        password: dto.password,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.databaseSource.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const source = await this.prisma.databaseSource.findUnique({
      where: { id },
    });

    if (!source) {
      throw new NotFoundException('Database source not found');
    }

    return source;
  }

  async update(id: number, dto: UpdateDatabaseSourceDto) {
    await this.findOne(id);

    return this.prisma.databaseSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.databaseSource.delete({
      where: { id },
    });
  }

  async toggleActive(id: number) {
    const source = await this.findOne(id);

    return this.prisma.databaseSource.update({
      where: { id },
      data: {
        isActive: !source.isActive,
      },
    });
  }
}