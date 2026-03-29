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
exports.CreateBackupPolicyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateBackupPolicyDto {
    sourceId;
    policyName;
    backupType;
    scheduleCron;
    retentionDays;
    maxBackups;
    isActive;
}
exports.CreateBackupPolicyDto = CreateBackupPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBackupPolicyDto.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Daily Studix Backup' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupPolicyDto.prototype, "policyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.BackupType, example: client_1.BackupType.FULL }),
    (0, class_validator_1.IsEnum)(client_1.BackupType),
    __metadata("design:type", String)
], CreateBackupPolicyDto.prototype, "backupType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0 2 * * *',
        description: 'cron expression',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupPolicyDto.prototype, "scheduleCron", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7, default: 7 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBackupPolicyDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBackupPolicyDto.prototype, "maxBackups", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupPolicyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-backup-policy.dto.js.map