import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { listNotifications, markRead, readAll } from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", requireAuth, requireVerifiedEmail, listNotifications);
router.patch("/:id", requireAuth, requireVerifiedEmail, markRead);
router.post("/read-all", requireAuth, requireVerifiedEmail, readAll);

export default router;
