import express from "express";

import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  listMyApplications,
  listApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/applications.controller.js";

const router = express.Router();

// Candidate
router.get("/", requireAuth, requireVerifiedEmail, requireRole("candidate"), listMyApplications);

// Recruiter
router.get(
  "/recruiter/jobs/:id/applicants",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  listApplicantsForJob
);

router.patch(
  "/recruiter/applications/:applicationId",
  requireAuth,
  requireVerifiedEmail,
  requireRole("recruiter"),
  updateApplicationStatus
);

export default router;
