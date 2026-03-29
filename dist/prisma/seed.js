"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    await prisma.databaseSource.create({
        data: {
            name: "Local Studix DB",
            dbType: client_1.DatabaseType.POSTGRESQL,
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
//# sourceMappingURL=seed.js.map