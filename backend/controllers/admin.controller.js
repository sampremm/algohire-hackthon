import * as templateService from "../services/template.service.js";
import * as notificationService from "../services/notification.service.js";
import * as deliveryService from "../services/delivery.service.js";

export async function createTemplate(req, res) {
  try {
    const { title, body } = req.body;
    const template = await templateService.createTemplate(title, body);
    res.status(201).json({ message: "Template created", template });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function listTemplates(req, res) {
  try {
    const templates = await templateService.listTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTemplate(req, res) {
  try {
    const template = await templateService.getTemplate(req.params.id);
    res.json(template);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

export async function triggerNotifications(req, res) {
  try {
    const { templateId, userIds, sendToAll } = req.body;

    let batch;

    if (sendToAll === true) {
      // ✅ NEW: send to all users
      batch = await notificationService.triggerNotificationsToAll(templateId);
    } else {
      if (!userIds || userIds.length === 0) {
        return res.status(400).json({ error: "userIds required if sendToAll is false" });
      }
      batch = await notificationService.triggerNotifications(templateId, userIds);
    }

    res.status(202).json({
      message: "Notifications queued",
      batchId: batch.id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


export async function getDeliveryStats(req, res) {
  try {
    const stats = await deliveryService.getDeliveryStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBatchStatus(req, res) {
  try {
    const status = await deliveryService.getBatchDeliveryStatus(req.params.batchId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
