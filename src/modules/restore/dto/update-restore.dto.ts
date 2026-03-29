import { PartialType } from '@nestjs/swagger';
import { CreateRestoreDto } from './create-restore.dto';

export class UpdateRestoreDto extends PartialType(CreateRestoreDto) {}
