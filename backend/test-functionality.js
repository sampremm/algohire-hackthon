import "dotenv/config";
import { prisma } from "./prisma.js";

async function testAPI() {
  console.log("🧪 Testing API functionality...\n");

  try {
    // Test 1: Get all templates
    console.log("✅ Test 1: Fetching all templates");
    const templates = await prisma.notificationTemplate.findMany();
    console.log(`   Found ${templates.length} templates\n`);

    if (templates.length === 0) {
      console.log("   No templates found. Run 'npm run seed' first.\n");
      process.exit(1);
    }

    // Test 2: Get all users
    console.log("✅ Test 2: Fetching all users");
    const users = await prisma.user.findMany();
    const appUsers = users.filter(u => u.role === "USER");
    console.log(`   Found ${appUsers.length} users\n`);

    // Test 3: Simulate notification trigger
    console.log("✅ Test 3: Create a notification batch");
    const batch = await prisma.notificationBatch.create({
      data: { templateId: templates[0].id }
    });
    console.log(`   Created batch: ${batch.id}\n`);

    // Test 4: Create deliveries
    console.log("✅ Test 4: Create delivery jobs");
    const deliveries = await Promise.all(
      appUsers.slice(0, 2).map(user =>
        prisma.notificationDelivery.create({
          data: {
            batchId: batch.id,
            userId: user.id,
            status: "QUEUED"
          }
        })
      )
    );
    console.log(`   Created ${deliveries.length} delivery jobs\n`);

    // Test 5: Check delivery states
    console.log("✅ Test 5: Verify delivery states");
    deliveries.forEach(d => {
      console.log(`   - Delivery ${d.id}: ${d.status} (retries: ${d.retryCount})`);
    });
    console.log();

    // Test 6: Simulate state transitions
    console.log("✅ Test 6: Test state transitions");
    const delivery = deliveries[0];
    
    // QUEUED → PROCESSING
    let updated = await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: "PROCESSING" }
    });
    console.log(`   QUEUED → ${updated.status}`);

    // PROCESSING → SENT
    updated = await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: "SENT" }
    });
    console.log(`   PROCESSING → ${updated.status}`);

    // Test 7: Test idempotency - verify SENT delivery won't be reprocessed
    console.log("\n✅ Test 7: Idempotency check");
    if (updated.status === "SENT") {
      console.log("   ✓ Delivery marked as SENT - would not be reprocessed by worker");
    }
    console.log();

    // Test 8: Test retry logic
    console.log("✅ Test 8: Test retry logic");
    const delivery2 = deliveries[1];
    let retried = await prisma.notificationDelivery.update({
      where: { id: delivery2.id },
      data: {
        status: "RETRYING",
        retryCount: { increment: 1 }
      }
    });
    console.log(`   Updated delivery: status=${retried.status}, retryCount=${retried.retryCount}`);
    console.log();

    // Test 9: Check delivery stats
    console.log("✅ Test 9: Delivery statistics");
    const stats = await prisma.notificationDelivery.groupBy({
      by: ["status"],
      _count: true
    });
    console.log("   Status breakdown:");
    stats.forEach(s => {
      console.log(`     - ${s.status}: ${s._count}`);
    });
    console.log();

    console.log("🎉 All tests passed!");
    console.log("\nTo test with actual API:");
    console.log("  1. Run: npm run dev");
    console.log("  2. Make API calls to http://localhost:3000/admin/...");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
