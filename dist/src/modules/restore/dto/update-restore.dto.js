"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRestoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_restore_dto_1 = require("./create-restore.dto");
class UpdateRestoreDto extends (0, swagger_1.PartialType)(create_restore_dto_1.CreateRestoreDto) {
}
exports.UpdateRestoreDto = UpdateRestoreDto;
//# sourceMappingURL=update-restore.dto.js.map