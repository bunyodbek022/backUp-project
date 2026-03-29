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
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const encryption_util_1 = require("../../utils/encryption.util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let BackupService = class BackupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    serializeBackup(backup) {
        return {
            ...backup,
            fileSize: backup.fileSize ? backup.fileSize.toString() : null,
        };
    }
    async createBackup(dto, currentUser) {
        const sourceWhere = currentUser.role === client_1.UserRole.SUPERADMIN
            ? { id: dto.sourceId }
            : { id: dto.sourceId, userId: currentUser.id };
        const source = await this.prisma.databaseSource.findFirst({
            where: sourceWhere,
        });
        if (!source) {
            throw new common_1.NotFoundException('Database source not found or access denied');
        }
        if (!source.isActive) {
            throw new common_1.BadRequestException('Database source is inactive');
        }
        if (source.dbType !== 'POSTGRESQL') {
            throw new common_1.BadRequestException('Only PostgreSQL is supported for now');
        }
        const startedAt = new Date();
        const timestamp = this.formatDate(startedAt);
        const fileName = `${source.dbName}_${timestamp}.sql`;
        const backupDir = path.join(process.cwd(), 'storage', 'backups');
        const filePath = path.join(backupDir, fileName);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const backup = await this.prisma.backup.create({
            data: {
                sourceId: source.id,
                backupName: `${source.name} backup ${timestamp}`,
                fileName,
                backupType: dto.backupType ?? client_1.BackupType.FULL,
                filePath,
                status: client_1.BackupStatus.RUNNING,
                createdById: currentUser.id,
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
                '-F', 'p',
                '-f', filePath
            ];
            await execFileAsync('pg_dump', args, {
                env: {
                    ...process.env,
                    PGPASSWORD: decryptedPassword,
                },
            });
            const stats = fs.statSync(filePath);
            const finishedAt = new Date();
            const durationSeconds = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
            const updated = await this.prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: client_1.BackupStatus.SUCCESS,
                    fileSize: BigInt(stats.size),
                    finishedAt,
                    durationSeconds,
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
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    createdBy: {
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
                    action: client_1.LogAction.BACKUP_SUCCESS,
                    message: `Backup created successfully for ${source.dbName}`,
                    sourceId: source.id,
                    userId: currentUser.id,
                },
            });
            return this.serializeBackup(updated);
        }
        catch (error) {
            const finishedAt = new Date();
            const durationSeconds = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
            const failed = await this.prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: client_1.BackupStatus.FAILED,
                    finishedAt,
                    durationSeconds,
                    errorMessage: error?.message || 'Backup failed',
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
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    createdBy: {
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
                    action: client_1.LogAction.BACKUP_FAILED,
                    message: `Backup failed for ${source.dbName}: ${error?.message || 'Unknown error'}`,
                    sourceId: source.id,
                    userId: currentUser.id,
                },
            });
            return this.serializeBackup(failed);
        }
    }
    async findAll(query, user) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const search = query.search || '';
        const skip = (page - 1) * limit;
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
        const searchWhere = search
            ? { backupName: { contains: search, mode: 'insensitive' } }
            : {};
        const where = { ...baseWhere, ...searchWhere };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.backup.count({ where }),
            this.prisma.backup.findMany({
                where,
                skip,
                take: limit,
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
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    id: 'desc',
                },
            }),
        ]);
        return {
            data: data.map((backup) => this.serializeBackup(backup)),
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
        const backup = await this.prisma.backup.findFirst({
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
                restores: true,
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        if (!backup) {
            throw new common_1.NotFoundException('Backup not found');
        }
        return this.serializeBackup(backup);
    }
    async getBackupFile(id, user) {
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? { id } : { id, source: { userId: user.id } };
        const backup = await this.prisma.backup.findFirst({
            where: baseWhere,
        });
        if (!backup) {
            throw new common_1.NotFoundException('Backup not found');
        }
        let filePath = backup.filePath;
        if (!filePath || !fs.existsSync(filePath)) {
            const fallbackPath = path.join(process.cwd(), 'storage', 'backups', backup.fileName);
            if (fs.existsSync(fallbackPath)) {
                filePath = fallbackPath;
            }
            else {
                throw new common_1.NotFoundException('Backup file not found on disk at stored path or fallback path');
            }
        }
        return { ...backup, filePath };
    }
    async remove(id, currentUser) {
        const baseWhere = currentUser.role === client_1.UserRole.SUPERADMIN ? { id } : { id, source: { userId: currentUser.id } };
        const backup = await this.prisma.backup.findFirst({
            where: baseWhere,
            include: {
                restores: {
                    select: { id: true },
                },
            },
        });
        if (!backup) {
            throw new common_1.NotFoundException('Backup not found');
        }
        if (backup.restores.length > 0) {
            throw new common_1.BadRequestException('This backup cannot be deleted because it is linked to restore records');
        }
        if (backup.filePath && fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }
        const deleted = await this.prisma.backup.delete({
            where: { id },
        });
        await this.prisma.systemLog.create({
            data: {
                level: client_1.LogLevel.INFO,
                action: client_1.LogAction.BACKUP_DELETE,
                message: `Backup deleted: ${deleted.backupName}`,
                sourceId: deleted.sourceId,
                userId: currentUser.id,
            },
        });
        return {
            message: 'Backup deleted successfully',
            id: deleted.id,
        };
    }
    async getStats(user) {
        const baseWhere = user.role === client_1.UserRole.SUPERADMIN ? {} : { source: { userId: user.id } };
        const [totalBackups, successBackups, failedBackups, runningBackups, latestBackup] = await Promise.all([
            this.prisma.backup.count({ where: baseWhere }),
            this.prisma.backup.count({
                where: { status: client_1.BackupStatus.SUCCESS, ...baseWhere },
            }),
            this.prisma.backup.count({
                where: { status: client_1.BackupStatus.FAILED, ...baseWhere },
            }),
            this.prisma.backup.count({
                where: { status: client_1.BackupStatus.RUNNING, ...baseWhere },
            }),
            this.prisma.backup.findFirst({
                where: baseWhere,
                orderBy: {
                    startedAt: 'desc',
                },
                include: {
                    source: {
                        select: {
                            id: true,
                            name: true,
                            dbName: true,
                        },
                    },
                },
            }),
        ]);
        return {
            totalBackups,
            successBackups,
            failedBackups,
            runningBackups,
            latestBackup: latestBackup ? this.serializeBackup(latestBackup) : null,
        };
    }
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d}_${h}-${min}-${s}`;
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], BackupService);
//# sourceMappingURL=backup.service.js.map