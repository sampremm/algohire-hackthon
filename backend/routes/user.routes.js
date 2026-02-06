import express from "express";
import {
  getNotifications,
  markAsRead
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markAsRead);


export default router;
