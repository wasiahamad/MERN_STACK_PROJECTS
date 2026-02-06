import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import {
	createProposal,
	daoStats,
	daoMe,
	listProposals,
	syncProposalOnChain,
	voteOnProposal,
} from "../controllers/dao.controller.js";

const router = express.Router();

router.get("/proposals", listProposals);
router.get("/stats", requireAuth, requireVerifiedEmail, daoStats);
router.post("/proposals", requireAuth, requireVerifiedEmail, createProposal);
router.post("/proposals/:id/votes", requireAuth, requireVerifiedEmail, voteOnProposal);
router.post("/proposals/:id/sync", requireAuth, requireVerifiedEmail, syncProposalOnChain);
router.get("/me", requireAuth, requireVerifiedEmail, daoMe);

export default router;
