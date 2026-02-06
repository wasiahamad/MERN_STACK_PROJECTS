import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  listMyCertificates,
  createCertificate,
  mintCertificate,
  verifyMyCertificate,
  verifyCertificatePublic,
} from "../controllers/certificates.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/certificates",
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = ext && /^\.[a-z0-9]+$/.test(ext) ? ext : "";
      cb(null, `${crypto.randomBytes(16).toString("hex")}${safeExt}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ok =
      mime === "application/pdf" ||
      mime === "image/png" ||
      mime === "image/jpeg" ||
      mime === "image/jpg" ||
      mime === "image/webp";
    cb(ok ? null : new Error("Only PDF, PNG, JPG, JPEG, or WEBP files are allowed"), ok);
  },
});

router.get("/me", requireAuth, requireVerifiedEmail, requireRole("candidate"), listMyCertificates);
router.post("/verify", verifyCertificatePublic);
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

router.post(
  "/me/:id/verify",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  verifyMyCertificate
);

export default router;
