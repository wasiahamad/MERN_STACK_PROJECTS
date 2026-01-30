import express from "express";

import { listPublicJobs, getPublicJob, listRecommendedJobs, toggleSaveJob } from "../controllers/jobs.controller.js";
import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { applyToJob } from "../controllers/applications.controller.js";

const router = express.Router();

// Public
router.get("/", optionalAuth, listPublicJobs);

// Candidate recommendations (must be before /:id)
router.get(
  "/recommended",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  listRecommendedJobs
);
router.get("/:id", optionalAuth, getPublicJob);

// Candidate apply
router.post(
  "/:id/applications",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  applyToJob
);

// Candidate save/unsave
router.post(
  "/:id/save",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  toggleSaveJob
);

export default router;
