import express from "express";
import multer from "multer";

import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  listMyCertificates,
  createCertificate,
  mintCertificate,
} from "../controllers/certificates.controller.js";

const router = express.Router();

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/me", requireAuth, requireVerifiedEmail, requireRole("candidate"), listMyCertificates);
router.post(
  "/me",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  upload.single("file"),
  createCertificate
);
router.post(
  "/me/:id/mint",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  mintCertificate
);

export default router;
