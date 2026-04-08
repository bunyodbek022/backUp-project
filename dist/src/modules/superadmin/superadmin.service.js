"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperadminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = __importDefault(require("../../Prisma/prisma.service"));
let SuperadminService = class SuperadminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const totalUsers = await this.prisma.user.count();
        const activeSubscribers = await this.prisma.user.count({
            where: { subscriptionStatus: 'active' },
        });
        const trialingUsers = await this.prisma.user.count({
            where: { subscriptionStatus: 'trialing' },
        });
        const inactiveUsers = await this.prisma.user.count({
            where: { subscriptionStatus: 'canceled' },
        });
        const activeUsers = await this.prisma.user.findMany({
            where: { subscriptionStatus: 'active' },
            include: { plan: true },
        });
        const monthlyRevenue = activeUsers.reduce((sum, user) => {
            return sum + (user.plan ? Number(user.plan.price) : 0);
        }, 0);
        const totalBackups = await this.prisma.backup.count();
        const totalDatabaseSources = await this.prisma.databaseSource.count();
        return {
            users: {
                total: totalUsers,
                active: activeSubscribers,
                trialing: trialingUsers,
                inactive: inactiveUsers,
            },
            financials: {
                estimatedMonthlyRevenue: monthlyRevenue,
                currency: 'USD',
            },
            system: {
                totalBackups,
                totalDatabaseSources,
            },
        };
    }
    async getSystemLogs() {
        return this.prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                user: { select: { email: true, fullName: true, role: true } },
            },
        });
    }
    async getUsers(query) {
        const { page = 1, limit = 10, search = '' } = query;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { plan: true },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getBackups(query) {
        const { page = 1, limit = 10, search = '' } = query;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                backupName: { contains: search, mode: 'insensitive' },
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.backup.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startedAt: 'desc' },
                include: {
                    source: true,
                    createdBy: { select: { email: true, fullName: true } },
                },
            }),
            this.prisma.backup.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getDatabases(query) {
        const { page = 1, limit = 10, search = '' } = query;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                name: { contains: search, mode: 'insensitive' },
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.databaseSource.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true, fullName: true } } },
            }),
            this.prisma.databaseSource.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getRevenueChart() {
        const activeUsers = await this.prisma.user.findMany({
            where: { subscriptionStatus: 'active' },
            include: { plan: true },
        });
        const currentMRR = activeUsers.reduce((sum, user) => {
            return sum + (user.plan ? Number(user.plan.price) : 0);
        }, 0);
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const currentDate = new Date();
        const chartData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const isCurrentMonth = i === 0;
            chartData.push({
                name: months[d.getMonth()],
                revenue: isCurrentMonth
                    ? currentMRR
                    : Math.max(0, currentMRR - i * 15 + (Math.random() * 10 - 5)),
            });
        }
        return chartData;
    }
};
exports.SuperadminService = SuperadminService;
exports.SuperadminService = SuperadminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], SuperadminService);
//# sourceMappingURL=superadmin.service.js.map