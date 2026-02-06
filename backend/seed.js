import "dotenv/config";
import { prisma } from "./prisma.js";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        role: "ADMIN"
      }
    }),
    prisma.user.create({
      data: {
        name: "Alice Johnson",
        role: "USER"
      }
    }),
    prisma.user.create({
      data: {
        name: "Bob Smith",
        role: "USER"
      }
    }),
    prisma.user.create({
      data: {
        name: "Carol White",
        role: "USER"
      }
    }),
    prisma.user.create({
      data: {
        name: "David Brown",
        role: "USER"
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create templates
  const templates = await Promise.all([
    prisma.notificationTemplate.create({
      data: {
        titleTemplate: "Welcome {{name}}",
        bodyTemplate: "Hello {{name}}, your account has been activated. Welcome to our platform!"
      }
    }),
    prisma.notificationTemplate.create({
      data: {
        titleTemplate: "Action Required - {{name}}",
        bodyTemplate: "Hi {{name}}, we need you to verify your email address to continue using our services."
      }
    }),
    prisma.notificationTemplate.create({
      data: {
        titleTemplate: "Special Offer for {{name}}",
        bodyTemplate: "Great news {{name}}! You have a special 20% discount waiting for you."
      }
    })
  ]);

  console.log(`✅ Created ${templates.length} templates`);

  console.log("\n📊 Database seeded successfully!");
  console.log("\nTest users (copy userId for API calls):");
  users.forEach((user, i) => {
    if (i > 0) {
      console.log(`  - ${user.name}: ${user.id}`);
    }
  });

  console.log("\nTest templates (copy templateId for API calls):");
  templates.forEach((template, i) => {
    console.log(`  - Template ${i + 1}: ${template.id}`);
  });

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
