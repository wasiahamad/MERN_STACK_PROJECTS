import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { changePassword, getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", requireAuth, requireVerifiedEmail, getSettings);
router.put("/", requireAuth, requireVerifiedEmail, updateSettings);
router.post("/password", requireAuth, requireVerifiedEmail, changePassword);

export default router;
