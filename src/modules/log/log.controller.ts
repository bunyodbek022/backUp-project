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
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LogService } from './log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({ summary: 'Get all system logs' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.logService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Get log by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.logService.findOne(id, user);
  }
}
