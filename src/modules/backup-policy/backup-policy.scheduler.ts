import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { LogAction, LogLevel } from '@prisma/client';
import PrismaService from 'src/Prisma/prisma.service';
import { BackupService } from '../backup/backup.service';

@Injectable()
export class BackupPolicyScheduler implements OnModuleInit {
  private readonly logger = new Logger(BackupPolicyScheduler.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly backupService: BackupService,
  ) {}

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

  registerPolicyJob(policy: {
    id: number;
    sourceId: number;
    policyName: string;
    scheduleCron: string;
    retentionDays: number;
    maxBackups: number | null;
    backupType: any;
    isActive: boolean;
  }) {
    const jobName = this.getJobName(policy.id);

    try {
      const existing = this.schedulerRegistry.getCronJobs();
      if (existing.has(jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
      }

      const job = new CronJob(policy.scheduleCron, async () => {
        this.logger.log(
          `Running backup policy #${policy.id} (${policy.policyName})`,
        );

        try {
          await this.backupService.createBackup(
            {
              sourceId: policy.sourceId,
              backupType: policy.backupType,
              notes: `[policy:${policy.id}] auto backup`,
            },
            { id: 1 }, // system user
          );

          await this.applyRetention(
            policy.sourceId,
            policy.retentionDays,
            policy.maxBackups,
          );

          await this.prisma.systemLog.create({
            data: {
              level: LogLevel.INFO,
              action: LogAction.BACKUP_SUCCESS,
              message: `Scheduled backup completed for policy: ${policy.policyName}`,
              sourceId: policy.sourceId,
              userId: 1,
            },
          });
        } catch (error: any) {
          this.logger.error(
            `Scheduled backup failed for policy #${policy.id}: ${error?.message || 'Unknown error'}`,
          );

          await this.prisma.systemLog.create({
            data: {
              level: LogLevel.ERROR,
              action: LogAction.BACKUP_FAILED,
              message: `Scheduled backup failed for policy ${policy.policyName}: ${error?.message || 'Unknown error'}`,
              sourceId: policy.sourceId,
              userId: 1,
            },
          });
        }
      });

      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();

      this.logger.log(
        `Cron job registered: ${jobName} -> ${policy.scheduleCron}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to register cron for policy #${policy.id}: ${error?.message || 'Invalid cron expression'}`,
      );
    }
  }

  removePolicyJob(policyId: number) {
    const jobName = this.getJobName(policyId);
    const jobs = this.schedulerRegistry.getCronJobs();

    if (jobs.has(jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`Cron job removed: ${jobName}`);
    }
  }

  listJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();

    const result: Array<{ name: string; nextRun: string | null }> = [];

    jobs.forEach((job, key) => {
      let nextRun: string | null = null;

      try {
        nextRun = job.nextDate().toJSDate().toISOString();
      } catch {
        nextRun = null;
      }

      result.push({
        name: key,
        nextRun,
      });
    });

    return result;
  }

  private getJobName(policyId: number) {
    return `backup-policy-${policyId}`;
  }

  private async applyRetention(
    sourceId: number,
    retentionDays: number,
    maxBackups: number | null,
  ) {
    const fs = await import('fs');

    const now = new Date();
    const cutoff = new Date(
      now.getTime() - retentionDays * 24 * 60 * 60 * 1000,
    );

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
}
