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
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = __importDefault(require("../../../Prisma/prisma.service"));
const client_1 = require("@prisma/client");
let SubscriptionGuard = class SubscriptionGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userPayload = request.user;
        if (!userPayload) {
            return false;
        }
        if (userPayload.role === client_1.UserRole.SUPERADMIN) {
            return true;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userPayload.id },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const now = new Date();
        if (user.subscriptionStatus === 'active') {
            return true;
        }
        if (user.trialEndsAt && user.trialEndsAt > now) {
            return true;
        }
        throw new common_1.ForbiddenException('Payment Required: Your 30-day free trial has expired. Please subscribe to continue.');
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.default])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map