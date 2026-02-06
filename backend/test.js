import "dotenv/config";
import { prisma } from "./prisma.js";

const users = await prisma.user.findMany();
console.log("DB connected ✅", users.length);
