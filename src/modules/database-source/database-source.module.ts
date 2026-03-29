import { Module } from '@nestjs/common';
import { DatabaseSourceService } from './database-source.service';
import { DatabaseSourceController } from './database-source.controller';

@Module({
  controllers: [DatabaseSourceController],
  providers: [DatabaseSourceService],
})
export class DatabaseSourceModule {}
