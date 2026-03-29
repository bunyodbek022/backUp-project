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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupPolicyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const subscription_guard_1 = require("../auth/guards/subscription.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const backup_policy_service_1 = require("./backup-policy.service");
const create_backup_policy_dto_1 = require("./dto/create-backup-policy.dto");
const update_backup_policy_dto_1 = require("./dto/update-backup-policy.dto");
const backup_policy_scheduler_1 = require("./backup-policy.scheduler");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let BackupPolicyController = class BackupPolicyController {
    backupPolicyService;
    backupPolicyScheduler;
    constructor(backupPolicyService, backupPolicyScheduler) {
        this.backupPolicyService = backupPolicyService;
        this.backupPolicyScheduler = backupPolicyScheduler;
    }
    create(dto, user) {
        return this.backupPolicyService.create(dto, user);
    }
    findAll(query, user) {
        return this.backupPolicyService.findAll(query, user);
    }
    listJobs() {
        return this.backupPolicyScheduler.listJobs();
    }
    findOne(id, user) {
        return this.backupPolicyService.findOne(id, user);
    }
    update(id, dto, user) {
        return this.backupPolicyService.update(id, dto, user);
    }
    toggleActive(id, user) {
        return this.backupPolicyService.toggleActive(id, user);
    }
    remove(id, user) {
        return this.backupPolicyService.remove(id, user);
    }
};
exports.BackupPolicyController = BackupPolicyController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create backup policy' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_backup_policy_dto_1.CreateBackupPolicyDto, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all backup policies' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List active cron jobs' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('scheduler/jobs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "listJobs", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get backup policy by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update backup policy' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_backup_policy_dto_1.UpdateBackupPolicyDto, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Toggle backup policy active status' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, common_1.Patch)(':id/toggle-active'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "toggleActive", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete backup policy' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BackupPolicyController.prototype, "remove", null);
exports.BackupPolicyController = BackupPolicyController = __decorate([
    (0, swagger_1.ApiTags)('Backup Policies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, subscription_guard_1.SubscriptionGuard),
    (0, common_1.Controller)('backup-policies'),
    __metadata("design:paramtypes", [backup_policy_service_1.BackupPolicyService, backup_policy_scheduler_1.BackupPolicyScheduler])
], BackupPolicyController);
//# sourceMappingURL=backup-policy.controller.js.map