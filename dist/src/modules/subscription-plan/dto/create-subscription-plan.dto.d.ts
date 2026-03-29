export declare class CreateSubscriptionPlanDto {
    name: string;
    price: number;
    currency?: string;
    interval?: string;
    features: string[];
    isActive?: boolean;
    stripePriceId?: string;
}
