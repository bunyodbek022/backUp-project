import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { RestoreService } from './restore.service';
import { CreateRestoreDto } from './dto/create-restore.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Restores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@Controller('restores')
export class RestoreController {
  constructor(private readonly restoreService: RestoreService) {}

  @ApiOperation({ summary: 'Create a restore from backup' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  create(@Body() dto: CreateRestoreDto, @CurrentUser() user: any) {
    return this.restoreService.createRestore(dto, user);
  }

  @ApiOperation({ summary: 'Get all restores' })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.restoreService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Get restore by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.restoreService.findOne(id, user);
  }
}