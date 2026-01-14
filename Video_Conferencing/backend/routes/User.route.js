import { Router } from "express";
import { register, login, me, updateMe } from "../controller/User.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);

// Zoom-main compatible endpoints (added; does not affect existing features)
// MeetingActivity removed (no history tracking)

export default router;