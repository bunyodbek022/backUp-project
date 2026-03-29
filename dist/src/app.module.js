"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const backup_module_1 = require("./modules/backup/backup.module");
const database_source_module_1 = require("./modules/database-source/database-source.module");
const auth_module_1 = require("./modules/auth/auth.module");
const prisma_module_1 = __importDefault(require("./Prisma/prisma.module"));
const config_1 = require("@nestjs/config");
const restore_module_1 = require("./modules/restore/restore.module");
const log_module_1 = require("./modules/log/log.module");
const schedule_1 = require("@nestjs/schedule");
const backup_policy_module_1 = require("./modules/backup-policy/backup-policy.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            backup_module_1.BackupModule,
            database_source_module_1.DatabaseSourceModule,
            auth_module_1.AuthModule,
            prisma_module_1.default,
            restore_module_1.RestoreModule,
            log_module_1.LogModule,
            backup_policy_module_1.BackupPolicyModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map