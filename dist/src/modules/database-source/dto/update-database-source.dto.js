"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDatabaseSourceDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_database_source_dto_1 = require("./create-database-source.dto");
class UpdateDatabaseSourceDto extends (0, mapped_types_1.PartialType)(create_database_source_dto_1.CreateDatabaseSourceDto) {
}
exports.UpdateDatabaseSourceDto = UpdateDatabaseSourceDto;
//# sourceMappingURL=update-database-source.dto.js.map