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
exports.DatabaseSourceController = void 0;
const common_1 = require("@nestjs/common");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const database_source_service_1 = require("./database-source.service");
const create_database_source_dto_1 = require("./dto/create-database-source.dto");
const update_database_source_dto_1 = require("./dto/update-database-source.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const subscription_guard_1 = require("../auth/guards/subscription.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DatabaseSourceController = class DatabaseSourceController {
    databaseSourceService;
    constructor(databaseSourceService) {
        this.databaseSourceService = databaseSourceService;
    }
    create(dto, user) {
        return this.databaseSourceService.create(dto, user);
    }
    findAll(query, user) {
        return this.databaseSourceService.findAll(query, user);
    }
    findOne(id, user) {
        return this.databaseSourceService.findOne(id, user);
    }
    update(id, dto, user) {
        return this.databaseSourceService.update(id, dto, user);
    }
    toggleActive(id, user) {
        return this.databaseSourceService.toggleActive(id, user);
    }
    remove(id, user) {
        return this.databaseSourceService.remove(id, user);
    }
    testConnection(id, user) {
        return this.databaseSourceService.testConnection(id, user);
    }
    getTables(id, user) {
        return this.databaseSourceService.getTables(id, user);
    }
    getTableData(id, tableName, limit, offset, user) {
        return this.databaseSourceService.getTableData(id, tableName, user, limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
    }
};
exports.DatabaseSourceController = DatabaseSourceController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a database source' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_database_source_dto_1.CreateDatabaseSourceDto, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all database sources' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get one database source by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a database source' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_database_source_dto_1.UpdateDatabaseSourceDto, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Toggle active status of database source' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/toggle-active'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "toggleActive", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a database source' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Test a database connection' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN),
    (0, common_1.Get)(':id/test-connection'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "testConnection", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get list of tables in the connected database' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(':id/tables'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "getTables", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get rows and columns from a specific table' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    (0, swagger_1.ApiParam)({ name: 'tableName', example: 'users' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, common_1.Get)(':id/tables/:tableName/data'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tableName')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], DatabaseSourceController.prototype, "getTableData", null);
exports.DatabaseSourceController = DatabaseSourceController = __decorate([
    (0, swagger_1.ApiTags)('Database Sources'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, subscription_guard_1.SubscriptionGuard),
    (0, common_1.Controller)('database-sources'),
    __metadata("design:paramtypes", [database_source_service_1.DatabaseSourceService])
], DatabaseSourceController);
//# sourceMappingURL=database-source.controller.js.map