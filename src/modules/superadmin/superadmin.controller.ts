import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('SuperAdmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
@Controller('superadmin')
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get comprehensive system statistics' })
  getStats() {
    return this.superadminService.getStats();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get recent system logs globally' })
  getLogs() {
    return this.superadminService.getSystemLogs();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  getUsers(@Query() query: PaginationDto) {
    return this.superadminService.getUsers(query);
  }

  @Get('backups')
  @ApiOperation({ summary: 'Get all backups with pagination and search' })
  getBackups(@Query() query: PaginationDto) {
    return this.superadminService.getBackups(query);
  }

  @Get('databases')
  @ApiOperation({
    summary: 'Get all database sources with pagination and search',
  })
  getDatabases(@Query() query: PaginationDto) {
    return this.superadminService.getDatabases(query);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get monthly revenue chart data' })
  getRevenueChart() {
    return this.superadminService.getRevenueChart();
  }
}
