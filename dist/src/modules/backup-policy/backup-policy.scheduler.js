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
var BackupPolicyScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupPolicyScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const client_1 = require("@prisma/client");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
const backup_service_1 = require("../backup/backup.service");
let BackupPolicyScheduler = BackupPolicyScheduler_1 = class BackupPolicyScheduler {
    schedulerRegistry;
    prisma;
    backupService;
    logger = new common_1.Logger(BackupPolicyScheduler_1.name);
    constructor(schedulerRegistry, prisma, backupService) {
        this.schedulerRegistry = schedulerRegistry;
        this.prisma = prisma;
        this.backupService = backupService;
    }
    async onModuleInit() {
        await this.syncAllPolicies();
    }
    async syncAllPolicies() {
        const policies = await this.prisma.backupPolicy.findMany({
            include: {
                source: true,
            },
        });
        const existingJobs = this.schedulerRegistry.getCronJobs();
        existingJobs.forEach((_job, key) => {
            if (key.startsWith('backup-policy-')) {
                this.schedulerRegistry.deleteCronJob(key);
            }
        });
        for (const policy of policies) {
            if (!policy.isActive || !policy.source?.isActive) {
                continue;
            }
            this.registerPolicyJob(policy);
        }
    }
    registerPolicyJob(policy) {
        const jobName = this.getJobName(policy.id);
        try {
            const existing = this.schedulerRegistry.getCronJobs();
            if (existing.has(jobName)) {
                this.schedulerRegistry.deleteCronJob(jobName);
            }
            const job = new cron_1.CronJob(policy.scheduleCron, async () => {
                this.logger.log(`Running backup policy #${policy.id} (${policy.policyName})`);
                try {
                    await this.backupService.createBackup({
                        sourceId: policy.sourceId,
                        backupType: policy.backupType,
                        notes: `[policy:${policy.id}] auto backup`,
                    }, { id: 1 });
                    await this.applyRetention(policy.sourceId, policy.retentionDays, policy.maxBackups);
                    await this.prisma.systemLog.create({
                        data: {
                            level: client_1.LogLevel.INFO,
                            action: client_1.LogAction.BACKUP_SUCCESS,
                            message: `Scheduled backup completed for policy: ${policy.policyName}`,
                            sourceId: policy.sourceId,
                            userId: 1,
                        },
                    });
                }
                catch (error) {
                    this.logger.error(`Scheduled backup failed for policy #${policy.id}: ${error?.message || 'Unknown error'}`);
                    await this.prisma.systemLog.create({
                        data: {
                            level: client_1.LogLevel.ERROR,
                            action: client_1.LogAction.BACKUP_FAILED,
                            message: `Scheduled backup failed for policy ${policy.policyName}: ${error?.message || 'Unknown error'}`,
                            sourceId: policy.sourceId,
                            userId: 1,
                        },
                    });
                }
            });
            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();
            this.logger.log(`Cron job registered: ${jobName} -> ${policy.scheduleCron}`);
        }
        catch (error) {
            this.logger.error(`Failed to register cron for policy #${policy.id}: ${error?.message || 'Invalid cron expression'}`);
        }
    }
    removePolicyJob(policyId) {
        const jobName = this.getJobName(policyId);
        const jobs = this.schedulerRegistry.getCronJobs();
        if (jobs.has(jobName)) {
            this.schedulerRegistry.deleteCronJob(jobName);
            this.logger.log(`Cron job removed: ${jobName}`);
        }
    }
    listJobs() {
        const jobs = this.schedulerRegistry.getCronJobs();
        const result = [];
        jobs.forEach((job, key) => {
            let nextRun = null;
            try {
                nextRun = job.nextDate().toJSDate().toISOString();
            }
            catch {
                nextRun = null;
            }
            result.push({
                name: key,
                nextRun,
            });
        });
        return result;
    }
    getJobName(policyId) {
        return `backup-policy-${policyId}`;
    }
    async applyRetention(sourceId, retentionDays, maxBackups) {
        const fs = await import('fs');
        const now = new Date();
        const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
        const oldBackups = await this.prisma.backup.findMany({
            where: {
                sourceId,
                startedAt: {
                    lt: cutoff,
                },
            },
            orderBy: {
                startedAt: 'asc',
            },
        });
        for (const backup of oldBackups) {
            if (backup.filePath && fs.existsSync(backup.filePath)) {
                fs.unlinkSync(backup.filePath);
            }
            await this.prisma.backup.delete({
                where: { id: backup.id },
            });
        }
        if (maxBackups) {
            const backups = await this.prisma.backup.findMany({
                where: { sourceId },
                orderBy: { startedAt: 'desc' },
            });
            const extraBackups = backups.slice(maxBackups);
            for (const backup of extraBackups) {
                if (backup.filePath && fs.existsSync(backup.filePath)) {
                    fs.unlinkSync(backup.filePath);
                }
                await this.prisma.backup.delete({
                    where: { id: backup.id },
                });
            }
        }
    }
};
exports.BackupPolicyScheduler = BackupPolicyScheduler;
exports.BackupPolicyScheduler = BackupPolicyScheduler = BackupPolicyScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [schedule_1.SchedulerRegistry,
        prisma_service_1.default,
        backup_service_1.BackupService])
], BackupPolicyScheduler);
//# sourceMappingURL=backup-policy.scheduler.js.map