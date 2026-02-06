import {prisma} from "../prisma.js";
import { notificationQueue } from "../queue/notification.queue.js";

export async function triggerNotifications(templateId, userIds) {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } }
  });

  if (users.length === 0) throw new Error("No users found");

  return createBatchAndQueue(templateId, users);
}

export async function triggerNotificationsToAll(templateId) {
  const users = await prisma.user.findMany({
    where: { role: "USER" }
  });

  if (users.length === 0) throw new Error("No users found");

  return createBatchAndQueue(templateId, users);
}

// shared logic
async function createBatchAndQueue(templateId, users) {
  const batch = await prisma.notificationBatch.create({
    data: { templateId }
  });

  for (const user of users) {
    const delivery = await prisma.notificationDelivery.create({
      data: {
        batchId: batch.id,
        userId: user.id,
        status: "QUEUED"
      }
    });

    await notificationQueue.add("deliver", {
      deliveryId: delivery.id
    });
  }

  return batch;
}
