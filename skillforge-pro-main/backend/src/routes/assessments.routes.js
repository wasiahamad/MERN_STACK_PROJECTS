import express from "express";

import { requireAuth, requireVerifiedEmail, requireRole } from "../middlewares/auth.js";
import { generateAssessment, submitAssessment, listAssessmentHistory } from "../controllers/assessments.controller.js";

const router = express.Router();

// Candidate-only assessment APIs
router.post("/generate", requireAuth, requireVerifiedEmail, requireRole("candidate"), generateAssessment);
router.post("/:attemptId/submit", requireAuth, requireVerifiedEmail, requireRole("candidate"), submitAssessment);

// History (candidate only for now)
router.get("/history", requireAuth, requireVerifiedEmail, requireRole("candidate"), listAssessmentHistory);

export default router;
