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
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
let LogService = class LogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, user) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { userId: user.id };
        const where = {
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
    async findOne(id, user) {
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? { id } : { id, userId: user.id };
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
            throw new common_1.NotFoundException('Log not found');
        }
        return log;
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], LogService);
//# sourceMappingURL=log.service.js.map