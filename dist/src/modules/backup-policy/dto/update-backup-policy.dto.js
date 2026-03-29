"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBackupPolicyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_backup_policy_dto_1 = require("./create-backup-policy.dto");
class UpdateBackupPolicyDto extends (0, swagger_1.PartialType)(create_backup_policy_dto_1.CreateBackupPolicyDto) {
}
exports.UpdateBackupPolicyDto = UpdateBackupPolicyDto;
//# sourceMappingURL=update-backup-policy.dto.js.map