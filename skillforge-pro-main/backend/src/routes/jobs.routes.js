import express from "express";

import { listPublicJobs, getPublicJob, listRecommendedJobs, toggleSaveJob } from "../controllers/jobs.controller.js";
import { listMatchedJobs } from "../controllers/matchedJobs.controller.js";
import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { applyToJob } from "../controllers/applications.controller.js";
import {
  candidateGetJobAssessment,
  candidateStartJobAssessmentAttempt,
  candidateSubmitJobAssessmentAttempt,
  candidateGetMyLatestJobAssessmentAttempt,
} from "../controllers/jobAssessments.controller.js";

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

// Candidate matched jobs (verified skills) (must be before /:id)
router.get(
  "/matched",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  listMatchedJobs
);

// Candidate job assessment
router.get(
  "/:id/assessment",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  candidateGetJobAssessment
);

router.get(
  "/:id/assessment/my-attempt",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  candidateGetMyLatestJobAssessmentAttempt
);

router.post(
  "/:id/assessment/attempts",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  candidateStartJobAssessmentAttempt
);

router.post(
  "/:id/assessment/attempts/:attemptId/submit",
  requireAuth,
  requireVerifiedEmail,
  requireRole("candidate"),
  candidateSubmitJobAssessmentAttempt
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
