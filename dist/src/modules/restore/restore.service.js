"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const encryption_util_1 = require("../../utils/encryption.util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let RestoreService = class RestoreService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRestore(dto, currentUser) {
        const backup = await this.prisma.backup.findUnique({
            where: { id: dto.backupId },
            include: {
                source: true,
            },
        });
        if (!backup) {
            throw new common_1.NotFoundException('Backup not found');
        }
        if (backup.status !== 'SUCCESS') {
            throw new common_1.BadRequestException('Only successful backups can be restored');
        }
        if (!backup.source) {
            throw new common_1.NotFoundException('Database source not found for this backup');
        }
        if (currentUser.role !== client_1.UserRole.SUPERADMIN && backup.source.userId !== currentUser.id) {
            throw new common_1.NotFoundException('Backup or database source not found or access denied');
        }
        const source = backup.source;
        if (!source.isActive) {
            throw new common_1.BadRequestException('Database source is inactive');
        }
        if (source.dbType !== 'POSTGRESQL') {
            throw new common_1.BadRequestException('Only PostgreSQL is supported for now');
        }
        if (!backup.filePath || !fs.existsSync(backup.filePath)) {
            throw new common_1.BadRequestException('Backup file not found on disk');
        }
        const startedAt = new Date();
        const restore = await this.prisma.restore.create({
            data: {
                backupId: backup.id,
                sourceId: source.id,
                targetDbName: source.dbName,
                status: client_1.RestoreStatus.RUNNING,
                restoredById: currentUser.id,
                notes: dto.notes ?? null,
            },
        });
        try {
            const decryptedPassword = (0, encryption_util_1.decrypt)(source.password);
            const args = [
                '-h', source.host,
                '-p', source.port.toString(),
                '-U', source.username,
                '-d', source.dbName,
                '-f', backup.filePath,
                '-v', 'ON_ERROR_STOP=1'
            ];
            await execFileAsync('psql', args, {
                env: {
                    ...process.env,
                    PGPASSWORD: decryptedPassword,
                },
            });
            const finishedAt = new Date();
            const durationSeconds = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
            const updated = await this.prisma.restore.update({
                where: { id: restore.id },
                data: {
                    status: client_1.RestoreStatus.SUCCESS,
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
                    level: client_1.LogLevel.INFO,
                    action: client_1.LogAction.RESTORE_SUCCESS,
                    message: `Restore completed successfully for ${source.dbName}`,
                    sourceId: source.id,
                    userId: currentUser.id,
                },
            });
            return updated;
        }
        catch (error) {
            const finishedAt = new Date();
            const durationSeconds = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
            const failed = await this.prisma.restore.update({
                where: { id: restore.id },
                data: {
                    status: client_1.RestoreStatus.FAILED,
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
                    level: client_1.LogLevel.ERROR,
                    action: client_1.LogAction.RESTORE_FAILED,
                    message: `Restore failed for ${source.dbName}: ${error?.message || 'Unknown error'}`,
                    sourceId: source.id,
                    userId: currentUser.id,
                },
            });
            return failed;
        }
    }
    async findAll(query, user) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const search = query.search || '';
        const skip = (page - 1) * limit;
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
        const searchWhere = search
            ? { targetDbName: { contains: search, mode: 'insensitive' } }
            : {};
        const where = { ...baseWhere, ...searchWhere };
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
    async findOne(id, user) {
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? { id } : { id, source: { userId: user.id } };
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
            throw new common_1.NotFoundException('Restore not found');
        }
        return restore;
    }
};
exports.RestoreService = RestoreService;
exports.RestoreService = RestoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], RestoreService);
//# sourceMappingURL=restore.service.js.map