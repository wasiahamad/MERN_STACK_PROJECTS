import express from "express";

import { listPublicJobs, getPublicJob, listRecommendedJobs } from "../controllers/jobs.controller.js";
import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { applyToJob } from "../controllers/applications.controller.js";

const router = express.Router();

// Public
router.get("/", listPublicJobs);

// Candidate recommendations (must be before /:id)
router.get(
  "/recommended",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  listRecommendedJobs
);
router.get("/:id", getPublicJob);

// Candidate apply
router.post(
  "/:id/applications",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  applyToJob
);

export default router;
