import { Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from 'src/Prisma/prisma.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: dto,
    });
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.subscriptionPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { price: 'asc' },
      }),
      this.prisma.subscriptionPlan.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  async update(id: number, dto: UpdateSubscriptionPlanDto) {
    await this.findOne(id); // Ensure exists
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }
}
