import "dotenv/config";
import { PrismaClient, DatabaseType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.databaseSource.create({
    data: {
      name: "Local Studix DB",
      dbType: DatabaseType.POSTGRESQL,
      host: "127.0.0.1",
      port: 5432,
      dbName: "studix_db",
      username: "postgres",
      password: "12345",
      isActive: true,
    },
  });

  console.log("Seed created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });