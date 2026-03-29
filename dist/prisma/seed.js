"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/back-up?schema=public";
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding Database...');
    const freePlan = await prisma.subscriptionPlan.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Free Trial',
            price: 0,
            interval: 'month',
            features: ['Basic Storage', 'Community Support'],
            isActive: true,
        },
    });
    const proPlan = await prisma.subscriptionPlan.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Pro',
            price: 29.99,
            interval: 'month',
            features: ['Unlimited Storage', 'Priority Support', 'Daily Backups'],
            isActive: true,
        },
    });
    const enterprisePlan = await prisma.subscriptionPlan.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: 'Enterprise',
            price: 99.99,
            interval: 'month',
            features: ['Dedicated Instance', '24/7 SLA', 'Custom Retention'],
            isActive: true,
        },
    });
    console.log('✅ Subscription Plans Seeded.');
    const superAdminEmail = 'superadmin@dataguard.pro';
    const hashedPassword = await bcrypt.hash('SuperSecret123!', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {},
        create: {
            fullName: 'System Super Admin',
            email: superAdminEmail,
            password: hashedPassword,
            role: client_1.UserRole.SUPERADMIN,
            isActive: true,
            subscriptionStatus: 'active',
        },
    });
    console.log('✅ SuperAdmin User Seeded (' + superAdmin.email + ').');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map