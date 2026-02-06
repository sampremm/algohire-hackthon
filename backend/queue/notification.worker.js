import { Worker } from "bullmq";
import { prisma } from "../prisma.js";
import { renderTemplate } from "../utils/templateRenderer.js";
import { connection } from "./notification.queue.js";

console.log("🚀 Worker started - listening for notification jobs...");

const worker = new Worker(
  "notifications",
  async job => {
    console.log(`📨 Processing job ${job.id}...`);
    const { deliveryId } = job.data;

    if (!deliveryId) {
      console.error("❌ Missing deliveryId in job data");
      return;
    }

    const delivery = await prisma.notificationDelivery.findUnique({
      where: { id: deliveryId }
    });

    if (!delivery) {
      console.error(`❌ Delivery ${deliveryId} not found`);
      return;
    }

    // Idempotency
    if (delivery.status === "SENT") {
      console.log(`⏭️ Delivery ${deliveryId} already sent, skipping`);
      return;
    }

    if (delivery.retryCount >= 3) {
      console.warn(`⛔ Max retries reached for ${deliveryId}`);
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: "FAILED" }
      });
      return;
    }

    await prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "PROCESSING" }
    });

    const batch = await prisma.notificationBatch.findUnique({
      where: { id: delivery.batchId }
    });

    if (!batch) {
      console.error(`❌ Batch ${delivery.batchId} not found`);
      return;
    }

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: batch.templateId }
    });

    if (!template) {
      console.error(`❌ Template ${batch.templateId} not found`);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: delivery.userId }
    });

    if (!user) {
      console.error(`❌ User ${delivery.userId} not found`);
      return;
    }

    const title = renderTemplate(template.titleTemplate, user);
    const body = renderTemplate(template.bodyTemplate, user);

    try {
      // Create user notification
      const notification = await prisma.userNotification.create({
        data: {
          userId: delivery.userId,
          title: title,
          body: body
        }
      });

      // Mark delivery as sent
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: "SENT" }
      });

      console.log(`✅ Notification ${notification.id} delivered to user ${delivery.userId}`);
    } catch (error) {
      console.error(`❌ Error creating notification:`, error.message);
      
      // Retry logic
      if (delivery.retryCount < 3) {
        await prisma.notificationDelivery.update({
          where: { id: deliveryId },
          data: {
            status: "RETRYING",
            retryCount: { increment: 1 }
          }
        });
        throw new Error(`Retry attempt ${delivery.retryCount + 1}/3`);
      } else {
        // Mark as failed after max retries
        await prisma.notificationDelivery.update({
          where: { id: deliveryId },
          data: { status: "FAILED" }
        });
      }
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✔️ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`✗ Job ${job.id} failed: ${err.message}`);
});
