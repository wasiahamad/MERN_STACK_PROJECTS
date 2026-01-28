import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { createProposal, daoMe, listProposals, voteOnProposal } from "../controllers/dao.controller.js";

const router = express.Router();

router.get("/proposals", listProposals);
router.post("/proposals", requireAuth, requireVerifiedEmail, createProposal);
router.post("/proposals/:id/votes", requireAuth, requireVerifiedEmail, voteOnProposal);
router.get("/me", requireAuth, requireVerifiedEmail, daoMe);

export default router;
