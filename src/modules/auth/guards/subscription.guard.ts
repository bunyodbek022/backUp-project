import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import PrismaService from 'src/Prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;

    if (!userPayload) {
      return false; // Not authenticated
    }

    if (userPayload.role === UserRole.SUPERADMIN) {
      return true; // Super Admin bypass
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.id },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const now = new Date();

    // Check if user has an active subscription
    if (user.subscriptionStatus === 'active') {
      return true;
    }

    // Check if user is still inside 30-day trial
    if (user.trialEndsAt && user.trialEndsAt > now) {
      return true;
    }

    throw new ForbiddenException(
      'Payment Required: Your 30-day free trial has expired. Please subscribe to continue.',
    );
  }
}
