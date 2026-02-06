import { prisma } from "../prisma.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    await prisma.userNotification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
