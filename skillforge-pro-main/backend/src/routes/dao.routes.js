import express from "express";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import {
	createProposal,
	daoStats,
	daoMe,
	deleteProposal,
	listProposals,
	setProposalStatus,
	syncProposalOnChain,
	updateProposal,
	voteOnProposal,
} from "../controllers/dao.controller.js";

const router = express.Router();

router.get("/proposals", optionalAuth, listProposals);
router.get("/stats", requireAuth, requireVerifiedEmail, daoStats);
router.post("/proposals", requireAuth, requireVerifiedEmail, createProposal);
router.patch("/proposals/:id", requireAuth, requireVerifiedEmail, updateProposal);
router.delete("/proposals/:id", requireAuth, requireVerifiedEmail, deleteProposal);
router.post("/proposals/:id/status", requireAuth, requireVerifiedEmail, setProposalStatus);
router.post("/proposals/:id/votes", requireAuth, requireVerifiedEmail, voteOnProposal);
router.post("/proposals/:id/sync", requireAuth, requireVerifiedEmail, syncProposalOnChain);
router.get("/me", requireAuth, requireVerifiedEmail, daoMe);

export default router;
