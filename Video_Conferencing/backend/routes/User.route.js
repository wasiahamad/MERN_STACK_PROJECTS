import { Router } from "express";
import { register, login, me, updateMe } from "../controller/User.controller.js";
import { addToActivity, getAllActivity } from "../controller/MeetingActivity.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);

// Zoom-main compatible endpoints (added; does not affect existing features)
router.post("/add_to_activity", requireAuth, addToActivity);
router.get("/get_all_activity", requireAuth, getAllActivity);

export default router;