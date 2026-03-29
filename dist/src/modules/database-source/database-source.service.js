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
};
exports.DatabaseSourceService = DatabaseSourceService;
exports.DatabaseSourceService = DatabaseSourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], DatabaseSourceService);
//# sourceMappingURL=database-source.service.js.map