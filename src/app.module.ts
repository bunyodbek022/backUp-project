import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackupModule } from './modules/backup/backup.module';
import { DatabaseSourceModule } from './modules/database-source/database-source.module';
import { AuthModule } from './modules/auth/auth.module';
import PrismaModule from './Prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RestoreModule } from './modules/restore/restore.module';
import { LogModule } from './modules/log/log.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupPolicyModule } from './modules/backup-policy/backup-policy.module';

@Module({
    imports: [
        ConfigModule.forRoot({
        isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        BackupModule,
        DatabaseSourceModule,
        AuthModule,
        PrismaModule,
        RestoreModule,
        LogModule,
        BackupPolicyModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
