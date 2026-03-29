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
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BackupPolicyService } from './backup-policy.service';
import { CreateBackupPolicyDto } from './dto/create-backup-policy.dto';
import { UpdateBackupPolicyDto } from './dto/update-backup-policy.dto';
import { BackupPolicyScheduler } from './backup-policy.scheduler';

@ApiTags('Backup Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backup-policies')
export class BackupPolicyController {
    constructor(private readonly backupPolicyService: BackupPolicyService, private readonly backupPolicyScheduler: BackupPolicyScheduler) { }

    @ApiOperation({ summary: 'Create backup policy' })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @Post()
    create(@Body() dto: CreateBackupPolicyDto, @CurrentUser() user: any) {
        return this.backupPolicyService.create(dto, user);
    }

    @ApiOperation({ summary: 'Get all backup policies' })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
    @Get()
    findAll() {
        return this.backupPolicyService.findAll();
    }

    @ApiOperation({ summary: 'List active cron jobs' })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @Get('scheduler/jobs')
    listJobs() {
        return this.backupPolicyScheduler.listJobs();
    }
    
    @ApiOperation({ summary: 'Get backup policy by id' })
    @ApiParam({ name: 'id', example: 1 })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.backupPolicyService.findOne(id);
    }

    @ApiOperation({ summary: 'Update backup policy' })
    @ApiParam({ name: 'id', example: 1 })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBackupPolicyDto,
        @CurrentUser() user: any,
    ) {
        return this.backupPolicyService.update(id, dto, user);
    }

    @ApiOperation({ summary: 'Toggle backup policy active status' })
    @ApiParam({ name: 'id', example: 1 })
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @Patch(':id/toggle-active')
    toggleActive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
        return this.backupPolicyService.toggleActive(id, user);
    }

    @ApiOperation({ summary: 'Delete backup policy' })
    @ApiParam({ name: 'id', example: 1 })
    @Roles(UserRole.SUPERADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.backupPolicyService.remove(id);
    }
}