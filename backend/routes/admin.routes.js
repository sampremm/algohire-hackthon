import express from "express";
import {
  createTemplate,
  listTemplates,
  getTemplate,
  triggerNotifications,
  getDeliveryStats,
  getBatchStatus
} from "../controllers/admin.controller.js";

const router = express.Router();

// Template endpoints
router.post("/templates", createTemplate);
router.get("/templates", listTemplates);
router.get("/templates/:id", getTemplate);

// Notification endpoints
router.post("/notify", triggerNotifications);
router.get("/stats", getDeliveryStats);
router.get("/batches/:batchId/status", getBatchStatus);

export default router;
