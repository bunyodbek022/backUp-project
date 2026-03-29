import { CanActivate, ExecutionContext } from '@nestjs/common';
import PrismaService from 'src/Prisma/prisma.service';
export declare class SubscriptionGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
