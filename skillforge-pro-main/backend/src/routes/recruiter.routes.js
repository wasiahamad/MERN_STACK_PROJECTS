import express from "express";
import multer from "multer";

import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { requireRecruiterProfileComplete } from "../middlewares/recruiterProfile.js";
import { getProfile, upsertProfile, uploadLogo } from "../controllers/recruiter.controller.js";
import { createJob, listJobs, getJob, updateJob, deleteJob } from "../controllers/recruiterJobs.controller.js";
import { listRecruiterCandidates, updateRecruiterCandidateStatus } from "../controllers/recruiterCandidates.controller.js";
import { listRecruiterActivity } from "../controllers/recruiterActivity.controller.js";
import { listApplicantsForJob } from "../controllers/applications.controller.js";
import { getRecruiterStats } from "../controllers/recruiterStats.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype || "");
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
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

// Frontend expects /company endpoints; keep aliases for compatibility
router.get("/company", requireAuth, requireVerifiedEmail, requireRole("recruiter"), getProfile);
router.put("/company", requireAuth, requireVerifiedEmail, requireRole("recruiter"), upsertProfile);
router.post(
  "/company/logo",
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

router.get(
  "/jobs/:id",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  getJob
);

// Frontend expects applicants route under recruiter
router.get(
  "/jobs/:id/applicants",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  listApplicantsForJob
);

router.post(
  "/jobs",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  requireRecruiterProfileComplete,
  createJob
);

router.put(
  "/jobs/:id",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  updateJob
);

router.delete(
  "/jobs/:id",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  deleteJob
);

// Recruiter candidates + activity (dashboard)
router.get(
  "/stats",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  getRecruiterStats
);
router.get(
  "/candidates",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  listRecruiterCandidates
);
router.patch(
  "/candidates/:id",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  updateRecruiterCandidateStatus
);
router.get(
  "/activity",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  listRecruiterActivity
);

export default router;
