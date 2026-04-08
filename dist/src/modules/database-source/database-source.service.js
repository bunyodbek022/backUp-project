"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSourceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
const encryption_util_1 = require("../../utils/encryption.util");
let DatabaseSourceService = class DatabaseSourceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitizeSource(source) {
        if (source && source.password) {
            source.password = '********';
        }
        return source;
    }
    async create(dto, user) {
        const source = await this.prisma.databaseSource.create({
            data: {
                name: dto.name,
                dbType: dto.dbType,
                host: dto.host,
                port: dto.port,
                dbName: dto.dbName,
                username: dto.username,
                password: (0, encryption_util_1.encrypt)(dto.password),
                isActive: dto.isActive ?? true,
                userId: user.id,
            },
        });
        return this.sanitizeSource(source);
    }
    async findAll(query, user) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const search = query.search || '';
        const skip = (page - 1) * limit;
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { userId: user.id };
        const searchWhere = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { host: { contains: search, mode: 'insensitive' } },
                    { dbName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const where = { ...baseWhere, ...searchWhere };
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
    async findOne(id, user) {
        const whereCondition = user.role === client_1.UserRole.SUPERADMIN ? { id } : { id, userId: user.id };
        const source = await this.prisma.databaseSource.findFirst({
            where: whereCondition,
        });
        if (!source) {
            throw new common_1.NotFoundException('Database source not found');
        }
        return this.sanitizeSource(source);
    }
    async update(id, dto, user) {
        await this.findOne(id, user);
        const updateData = { ...dto };
        if (updateData.password === '********') {
            delete updateData.password;
        }
        else if (updateData.password) {
            updateData.password = (0, encryption_util_1.encrypt)(updateData.password);
        }
        const source = await this.prisma.databaseSource.update({
            where: { id },
            data: updateData,
        });
        return this.sanitizeSource(source);
    }
    async remove(id, user) {
        await this.findOne(id, user);
        await this.prisma.systemLog.updateMany({
            where: { sourceId: id },
            data: { sourceId: null },
        });
        return this.prisma.databaseSource.delete({
            where: { id },
        });
    }
    async toggleActive(id, user) {
        const source = await this.findOne(id, user);
        return this.prisma.databaseSource.update({
            where: { id },
            data: {
                isActive: !source.isActive,
            },
        });
    }
    async testConnection(id, user) {
        const sourceData = await this.findOne(id, user);
        const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
        if (!source)
            throw new common_1.NotFoundException('Source not found');
        const password = (0, encryption_util_1.decrypt)(source.password);
        if (source.dbType === 'POSTGRESQL') {
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
            }
            catch (error) {
                return { success: false, message: error.message };
            }
        }
        else if (source.dbType === 'MYSQL') {
            try {
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
            }
            catch (error) {
                return { success: false, message: error.message || 'MySQL connection failed' };
            }
        }
        return { success: false, message: 'Unsupported DB Type' };
    }
    async getTables(id, user) {
        const sourceData = await this.findOne(id, user);
        const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
        if (!source)
            throw new common_1.NotFoundException('Source not found');
        const password = (0, encryption_util_1.decrypt)(source.password);
        if (source.dbType === 'POSTGRESQL') {
            const { Client } = require('pg');
            const client = new Client({
                host: source.host,
                port: source.port,
                database: source.dbName,
                user: source.username,
                password,
            });
            await client.connect();
            const res = await client.query(`SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
         ORDER BY table_name`);
            await client.end();
            return res.rows.map((r) => r.table_name);
        }
        else if (source.dbType === 'MYSQL') {
            const mysql = require('mysql2/promise');
            const conn = await mysql.createConnection({
                host: source.host,
                port: source.port,
                user: source.username,
                password,
                database: source.dbName,
            });
            const [rows] = await conn.execute(`SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' 
         ORDER BY TABLE_NAME`);
            await conn.end();
            return rows.map((r) => r.TABLE_NAME);
        }
        return [];
    }
    async getTableData(id, tableName, user, limit = 50, offset = 0) {
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error('Invalid table name');
        }
        const sourceData = await this.findOne(id, user);
        const source = await this.prisma.databaseSource.findUnique({ where: { id: sourceData.id } });
        if (!source)
            throw new common_1.NotFoundException('Source not found');
        const password = (0, encryption_util_1.decrypt)(source.password);
        if (source.dbType === 'POSTGRESQL') {
            const { Client } = require('pg');
            const client = new Client({
                host: source.host,
                port: source.port,
                database: source.dbName,
                user: source.username,
                password,
            });
            await client.connect();
            const colRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1 
         ORDER BY ordinal_position`, [tableName]);
            const countRes = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
            const dataRes = await client.query(`SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`, [limit, offset]);
            await client.end();
            return {
                columns: colRes.rows,
                rows: dataRes.rows,
                total: parseInt(countRes.rows[0].count, 10),
            };
        }
        else if (source.dbType === 'MYSQL') {
            const mysql = require('mysql2/promise');
            const conn = await mysql.createConnection({
                host: source.host,
                port: source.port,
                user: source.username,
                password,
                database: source.dbName,
            });
            const [colRows] = await conn.execute(`SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? 
         ORDER BY ORDINAL_POSITION`, [tableName]);
            const [countRows] = await conn.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            const [dataRows] = await conn.execute(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [limit, offset]);
            await conn.end();
            return {
                columns: colRows,
                rows: dataRows,
                total: parseInt(countRows[0].cnt, 10),
            };
        }
        return { columns: [], rows: [], total: 0 };
    }
};
exports.DatabaseSourceService = DatabaseSourceService;
exports.DatabaseSourceService = DatabaseSourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], DatabaseSourceService);
//# sourceMappingURL=database-source.service.js.map