import express from "express";
import multer from "multer";

import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { requireRecruiterProfileComplete } from "../middlewares/recruiterProfile.js";
import { getProfile, upsertProfile, uploadLogo } from "../controllers/recruiter.controller.js";
import { createJob, listJobs } from "../controllers/recruiterJobs.controller.js";

const router = express.Router();

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/profile", requireAuth, requireVerifiedEmail, requireRole("recruiter"), getProfile);
router.put("/profile", requireAuth, requireVerifiedEmail, requireRole("recruiter"), upsertProfile);
router.post(
  "/profile/logo",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  upload.single("logo"),
  uploadLogo
);

// Jobs (Recruiter-only)
router.get(
  "/jobs",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  listJobs
);

router.post(
  "/jobs",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  requireRecruiterProfileComplete,
  createJob
);

export default router;
