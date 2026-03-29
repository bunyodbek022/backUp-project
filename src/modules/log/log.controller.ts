import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({ summary: 'Get all system logs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get()
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @ApiOperation({ summary: 'Get log by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logService.findOne(id);
  }
}