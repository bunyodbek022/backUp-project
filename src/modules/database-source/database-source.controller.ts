import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DatabaseSourceService } from './database-source.service';
import { CreateDatabaseSourceDto } from './dto/create-database-source.dto';
import { UpdateDatabaseSourceDto } from './dto/update-database-source.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Database Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@Controller('database-sources')
export class DatabaseSourceController {
  constructor(private readonly databaseSourceService: DatabaseSourceService) {}

  @ApiOperation({ summary: 'Create a database source' })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateDatabaseSourceDto, @CurrentUser() user: any) {
    return this.databaseSourceService.create(dto, user);
  }

  @ApiOperation({ summary: 'Get all database sources' })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    return this.databaseSourceService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Get one database source by id' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.OPERATOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.databaseSourceService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a database source' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDatabaseSourceDto,
    @CurrentUser() user: any,
  ) {
    return this.databaseSourceService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Toggle active status of database source' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.databaseSourceService.toggleActive(id, user);
  }

  @ApiOperation({ summary: 'Delete a database source' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.databaseSourceService.remove(id, user);
  }
}