import express from "express";
import multer from "multer";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { getMe, updateMe, uploadAvatar } from "../controllers/me.controller.js";

const router = express.Router();

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", requireAuth, requireVerifiedEmail, getMe);
router.put("/", requireAuth, requireVerifiedEmail, updateMe);
router.post("/avatar", requireAuth, requireVerifiedEmail, upload.single("avatar"), uploadAvatar);

export default router;
