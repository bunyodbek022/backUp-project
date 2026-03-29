import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/back-up?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

  // 1. Seed Subscription Plans
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

  // 2. Seed SuperAdmin
  const superAdminEmail = 'superadmin@dataguard.pro';
  const hashedPassword = await bcrypt.hash('SuperSecret123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {}, // Don't reset password if already exists
    create: {
      fullName: 'System Super Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
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