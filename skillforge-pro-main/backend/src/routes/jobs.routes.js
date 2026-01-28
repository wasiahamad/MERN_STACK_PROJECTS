import express from "express";

import { listPublicJobs, getPublicJob } from "../controllers/jobs.controller.js";
import { requireAuth, requireRole, requireVerifiedEmail } from "../middlewares/auth.js";
import { applyToJob } from "../controllers/applications.controller.js";

const router = express.Router();

// Public
router.get("/", listPublicJobs);
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
