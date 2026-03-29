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
exports.BackupPolicyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
const backup_policy_scheduler_1 = require("./backup-policy.scheduler");
let BackupPolicyService = class BackupPolicyService {
    prisma;
    backupPolicyScheduler;
    constructor(prisma, backupPolicyScheduler) {
        this.prisma = prisma;
        this.backupPolicyScheduler = backupPolicyScheduler;
    }
    async create(dto, currentUser) {
        const sourceWhere = currentUser.role === client_1.UserRole.SUPERADMIN
            ? { id: dto.sourceId }
            : { id: dto.sourceId, userId: currentUser.id };
        const source = await this.prisma.databaseSource.findFirst({
            where: sourceWhere,
        });
        if (!source) {
            throw new common_1.NotFoundException('Database source not found or access denied');
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
                level: client_1.LogLevel.INFO,
                action: client_1.LogAction.POLICY_CREATE,
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
    async findAll(query, user) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const search = query.search || '';
        const skip = (page - 1) * limit;
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
        const searchWhere = search
            ? { policyName: { contains: search, mode: 'insensitive' } }
            : {};
        const where = { ...baseWhere, ...searchWhere };
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
    async findOne(id, user) {
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? { id } : { id, source: { userId: user.id } };
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
            throw new common_1.NotFoundException('Backup policy not found');
        }
        return policy;
    }
    async update(id, dto, currentUser) {
        await this.findOne(id, currentUser);
        if (dto.sourceId) {
            const sourceWhere = currentUser.role === client_1.UserRole.SUPERADMIN
                ? { id: dto.sourceId }
                : { id: dto.sourceId, userId: currentUser.id };
            const source = await this.prisma.databaseSource.findFirst({
                where: sourceWhere,
            });
            if (!source) {
                throw new common_1.NotFoundException('Database source not found');
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
                level: client_1.LogLevel.INFO,
                action: client_1.LogAction.POLICY_UPDATE,
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
    async remove(id, user) {
        await this.findOne(id, user);
        this.backupPolicyScheduler.removePolicyJob(id);
        return this.prisma.backupPolicy.delete({
            where: { id },
        });
    }
    async toggleActive(id, currentUser) {
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
                level: client_1.LogLevel.INFO,
                action: client_1.LogAction.POLICY_UPDATE,
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
};
exports.BackupPolicyService = BackupPolicyService;
exports.BackupPolicyService = BackupPolicyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default,
        backup_policy_scheduler_1.BackupPolicyScheduler])
], BackupPolicyService);
//# sourceMappingURL=backup-policy.service.js.map