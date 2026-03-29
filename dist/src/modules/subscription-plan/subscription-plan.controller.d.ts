import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SubscriptionPlanController {
    private readonly subscriptionPlanService;
    constructor(subscriptionPlanService: SubscriptionPlanService);
    findAll(query: PaginationDto): Promise<{
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            price: import("@prisma/client/runtime/client").Decimal;
            currency: string;
            interval: string;
            features: string[];
            stripePriceId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        interval: string;
        features: string[];
        stripePriceId: string | null;
    }>;
    create(dto: CreateSubscriptionPlanDto): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        interval: string;
        features: string[];
        stripePriceId: string | null;
    }>;
    update(id: number, dto: UpdateSubscriptionPlanDto): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        interval: string;
        features: string[];
        stripePriceId: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        interval: string;
        features: string[];
        stripePriceId: string | null;
    }>;
}
