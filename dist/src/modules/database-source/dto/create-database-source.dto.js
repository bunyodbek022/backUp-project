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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDatabaseSourceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateDatabaseSourceDto {
    name;
    dbType;
    host;
    port;
    dbName;
    username;
    password;
    isActive;
}
exports.CreateDatabaseSourceDto = CreateDatabaseSourceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Studix Production DB' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DatabaseType, example: client_1.DatabaseType.POSTGRESQL }),
    (0, class_validator_1.IsEnum)(client_1.DatabaseType),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "dbType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '127.0.0.1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5432 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDatabaseSourceDto.prototype, "port", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'studix_db' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "dbName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'postgres' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDatabaseSourceDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDatabaseSourceDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-database-source.dto.js.map