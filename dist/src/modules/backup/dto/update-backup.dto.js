"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBackupDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_backup_dto_1 = require("./create-backup.dto");
class UpdateBackupDto extends (0, mapped_types_1.PartialType)(create_backup_dto_1.CreateBackupDto) {
}
exports.UpdateBackupDto = UpdateBackupDto;
//# sourceMappingURL=update-backup.dto.js.map