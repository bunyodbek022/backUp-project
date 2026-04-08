import { Injectable } from '@nestjs/common';
import PrismaService from 'src/Prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SuperadminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();

    const activeSubscribers = await this.prisma.user.count({
      where: { subscriptionStatus: 'active' },
    });

    const trialingUsers = await this.prisma.user.count({
      where: { subscriptionStatus: 'trialing' },
    });

    const inactiveUsers = await this.prisma.user.count({
      where: { subscriptionStatus: 'canceled' }, // or inactive logic
    });

    // Calculate MRR
    const activeUsers = await this.prisma.user.findMany({
      where: { subscriptionStatus: 'active' },
      include: { plan: true },
    });

    const monthlyRevenue = activeUsers.reduce((sum, user) => {
      // Assuming non-null plans and adding their price
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
      take: 200, // Fetch the latest 200 logs
      include: {
        user: { select: { email: true, fullName: true, role: true } },
      },
    });
  }

  async getUsers(query: PaginationDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
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

  async getBackups(query: PaginationDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          backupName: { contains: search, mode: 'insensitive' as const },
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

  async getDatabases(query: PaginationDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: { contains: search, mode: 'insensitive' as const },
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
    // Calculate current MRR
    const activeUsers = await this.prisma.user.findMany({
      where: { subscriptionStatus: 'active' },
      include: { plan: true },
    });

    const currentMRR = activeUsers.reduce((sum, user) => {
      return sum + (user.plan ? Number(user.plan.price) : 0);
    }, 0);

    // Generate 12 months of data, ending with current month
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

    const chartData: { name: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const isCurrentMonth = i === 0;
      chartData.push({
        name: months[d.getMonth()],
        // Mock a representative trend for visual purposes
        revenue: isCurrentMonth
          ? currentMRR
          : Math.max(0, currentMRR - i * 15 + (Math.random() * 10 - 5)),
      });
    }

    return chartData;
  }
}
