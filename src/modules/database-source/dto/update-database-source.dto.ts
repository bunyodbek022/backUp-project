import { PartialType } from '@nestjs/mapped-types';
import { CreateDatabaseSourceDto } from './create-database-source.dto';

export class UpdateDatabaseSourceDto extends PartialType(
  CreateDatabaseSourceDto,
) {}
