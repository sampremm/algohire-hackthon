import { prisma } from "./prisma.js";
import { notificationQueue } from "./queue/notification.queue.js";

console.log("🔍 Debugging notifications...\n");

// Check 1: Users exist
console.log("1️⃣ Checking users...");
const users = await prisma.user.findMany();
console.log(`   Found ${users.length} users:`, users.map(u => `${u.name} (${u.id})`).join(", "));

// Check 2: Templates exist
console.log("\n2️⃣ Checking templates...");
const templates = await prisma.notificationTemplate.findMany();
console.log(`   Found ${templates.length} templates:`, templates.map(t => t.titleTemplate).join(", "));

// Check 3: Batches exist
console.log("\n3️⃣ Checking batches...");
const batches = await prisma.notificationBatch.findMany();
console.log(`   Found ${batches.length} batches`);

// Check 4: Deliveries exist
console.log("\n4️⃣ Checking deliveries...");
const deliveries = await prisma.notificationDelivery.findMany();
console.log(`   Found ${deliveries.length} deliveries:`);
deliveries.forEach(d => {
  console.log(`   - ID: ${d.id.slice(0, 8)}... | Status: ${d.status} | Retries: ${d.retryCount}`);
});

// Check 5: User notifications exist
console.log("\n5️⃣ Checking user notifications...");
const notifications = await prisma.userNotification.findMany();
console.log(`   Found ${notifications.length} notifications`);
if (notifications.length > 0) {
  notifications.slice(0, 3).forEach(n => {
    console.log(`   - Title: ${n.title} | Body: ${n.body.slice(0, 30)}...`);
  });
}

// Check 6: Queue status
console.log("\n6️⃣ Checking queue...");
const queueCount = await notificationQueue.count();
console.log(`   Jobs in queue: ${queueCount}`);

console.log("\n✅ Diagnostics complete!");
process.exit(0);
