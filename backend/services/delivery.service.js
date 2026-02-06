import { prisma } from "../prisma.js";

export function getUserNotifications(userId) {
  return prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

export function markNotificationAsRead(id) {
  return prisma.userNotification.update({
    where: { id },
    data: { isRead: true }
  });
}

// Admin metrics
export async function getDeliveryStats() {
  const [queued, processing, retrying, sent, failed] = await Promise.all([
    prisma.notificationDelivery.count({ where: { status: "QUEUED" } }),
    prisma.notificationDelivery.count({ where: { status: "PROCESSING" } }),
    prisma.notificationDelivery.count({ where: { status: "RETRYING" } }),
    prisma.notificationDelivery.count({ where: { status: "SENT" } }),
    prisma.notificationDelivery.count({ where: { status: "FAILED" } })
  ]);

  const total = queued + processing + retrying + sent + failed;

  return {
    total,
    queued,
    processing,
    retrying,
    sent,
    failed,
    successRate: total > 0 ? ((sent / total) * 100).toFixed(2) + "%" : "0%"
  };
}

export async function getBatchDeliveryStatus(batchId) {
  const deliveries = await prisma.notificationDelivery.findMany({
    where: { batchId },
  });

  const stats = {
    total: deliveries.length,
    byStatus: {}
  };

  deliveries.forEach(d => {
    stats.byStatus[d.status] = (stats.byStatus[d.status] || 0) + 1;
  });

  return { batchId, ...stats, deliveries };
}
