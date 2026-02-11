import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  changePassword,
  deleteAccount,
  getActiveSessions,
  getSettings,
  getWalletStats,
  revokeSession,
  updateSettings,
} from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", requireAuth, requireVerifiedEmail, getSettings);
router.put("/", requireAuth, requireVerifiedEmail, updateSettings);
router.post("/password", requireAuth, requireVerifiedEmail, changePassword);

// Sessions
router.get("/sessions", requireAuth, requireVerifiedEmail, getActiveSessions);
router.delete("/sessions/:sessionId", requireAuth, requireVerifiedEmail, revokeSession);

// Wallet
router.get("/wallet/stats", requireAuth, requireVerifiedEmail, getWalletStats);

// Account deletion
router.post("/delete-account", requireAuth, requireVerifiedEmail, deleteAccount);

export default router;
