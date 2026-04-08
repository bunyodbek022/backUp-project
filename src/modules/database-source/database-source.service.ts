import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
import { encrypt, decrypt } from '../../utils/encryption.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DatabaseSourceService {
  constructor(private readonly prisma: PrismaService) { }

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

    const baseWhere =
      user.role === UserRole.SUPERADMIN ? {} : { userId: user.id };
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
    const whereCondition =
      user.role === UserRole.SUPERADMIN ? { id } : { id, userId: user.id };
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

  async testConnection(id: number, user: any) {
    const sourceData = await this.findOne(id, user);
    const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
    if (!source) throw new NotFoundException('Source not found');

    const password = decrypt(source.password);

    if (source.dbType === 'POSTGRESQL') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Client } = require('pg');
      const client = new Client({
        host: source.host,
        port: source.port,
        database: source.dbName,
        user: source.username,
        password: password,
      });
      try {
        await client.connect();
        await client.end();
        return { success: true, message: 'Connection successful' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    } else if (source.dbType === 'MYSQL') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: source.host,
          port: source.port,
          user: source.username,
          password: password,
          database: source.dbName,
        });
        await connection.end();
        return { success: true, message: 'Connection successful' };
      } catch (error: any) {
        return { success: false, message: error.message || 'MySQL connection failed' };
      }
    }

    return { success: false, message: 'Unsupported DB Type' };
  }

  async getTables(id: number, user: any): Promise<string[]> {
    const sourceData = await this.findOne(id, user);
    const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
    if (!source) throw new NotFoundException('Source not found');

    const password = decrypt(source.password);

    if (source.dbType === 'POSTGRESQL') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Client } = require('pg');
      const client = new Client({
        host: source.host,
        port: source.port,
        database: source.dbName,
        user: source.username,
        password,
      });
      await client.connect();
      const res = await client.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
         ORDER BY table_name`,
      );
      await client.end();
      return res.rows.map((r: any) => r.table_name as string);
    } else if (source.dbType === 'MYSQL') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mysql = require('mysql2/promise');
      const conn = await mysql.createConnection({
        host: source.host,
        port: source.port,
        user: source.username,
        password,
        database: source.dbName,
      });
      const [rows]: any = await conn.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' 
         ORDER BY TABLE_NAME`,
      );
      await conn.end();
      return rows.map((r: any) => r.TABLE_NAME as string);
    }

    return [];
  }

  async getTableData(
    id: number,
    tableName: string,
    user: any,
    limit = 50,
    offset = 0,
  ) {
    // Validate table name to prevent SQL injection (only allow alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Invalid table name');
    }

    const sourceData = await this.findOne(id, user);
    const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
    if (!source) throw new NotFoundException('Source not found');

    const password = decrypt(source.password);

    if (source.dbType === 'POSTGRESQL') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Client } = require('pg');
      const client = new Client({
        host: source.host,
        port: source.port,
        database: source.dbName,
        user: source.username,
        password,
      });
      await client.connect();

      const colRes = await client.query(
        `SELECT column_name, data_type FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1 
         ORDER BY ordinal_position`,
        [tableName],
      );
      const countRes = await client.query(
        `SELECT COUNT(*) FROM "${tableName}"`,
      );
      const dataRes = await client.query(
        `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      await client.end();

      return {
        columns: colRes.rows,
        rows: dataRes.rows,
        total: parseInt(countRes.rows[0].count, 10),
      };
    } else if (source.dbType === 'MYSQL') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mysql = require('mysql2/promise');
      const conn = await mysql.createConnection({
        host: source.host,
        port: source.port,
        user: source.username,
        password,
        database: source.dbName,
      });

      const [colRows]: any = await conn.execute(
        `SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? 
         ORDER BY ORDINAL_POSITION`,
        [tableName],
      );
      const [countRows]: any = await conn.execute(
        `SELECT COUNT(*) as cnt FROM \`${tableName}\``,
      );
      const [dataRows]: any = await conn.execute(
        `SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      await conn.end();

      return {
        columns: colRows,
        rows: dataRows,
        total: parseInt(countRows[0].cnt, 10),
      };
    }

    return { columns: [], rows: [], total: 0 };
  }
}
