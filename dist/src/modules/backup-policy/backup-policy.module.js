"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupPolicyModule = void 0;
const common_1 = require("@nestjs/common");
const backup_policy_service_1 = require("./backup-policy.service");
const backup_policy_controller_1 = require("./backup-policy.controller");
const backup_policy_scheduler_1 = require("./backup-policy.scheduler");
const backup_service_1 = require("../backup/backup.service");
let BackupPolicyModule = class BackupPolicyModule {
};
exports.BackupPolicyModule = BackupPolicyModule;
exports.BackupPolicyModule = BackupPolicyModule = __decorate([
    (0, common_1.Module)({
        controllers: [backup_policy_controller_1.BackupPolicyController],
        providers: [backup_policy_service_1.BackupPolicyService, backup_policy_scheduler_1.BackupPolicyScheduler, backup_service_1.BackupService],
    })
], BackupPolicyModule);
//# sourceMappingURL=backup-policy.module.js.map