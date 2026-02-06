// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";

// console.log("🚨 DATABASE_URL =", process.env.DATABASE_URL);

// export const prisma = new PrismaClient({
//   log: ["error"]
// });


import pkg from "@prisma/client";
const { PrismaClient } = pkg;

console.log("🚨 DATABASE_URL =", process.env.DATABASE_URL);

export const prisma = new PrismaClient();
