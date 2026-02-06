import "dotenv/config";
import { prisma } from "./prisma.js";

console.log("Starting database test...");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful!");
    console.log("Result:", result);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    console.error(error.code);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
