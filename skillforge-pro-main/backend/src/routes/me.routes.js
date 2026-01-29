import express from "express";
import multer from "multer";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  getMe,
  updateMe,
  uploadAvatar,
  addSkill,
  updateSkill,
  deleteSkill,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
} from "../controllers/me.controller.js";

const router = express.Router();

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", requireAuth, requireVerifiedEmail, getMe);
router.put("/", requireAuth, requireVerifiedEmail, updateMe);
router.post("/avatar", requireAuth, requireVerifiedEmail, upload.single("avatar"), uploadAvatar);

// Candidate profile CRUD
router.post("/skills", requireAuth, requireVerifiedEmail, addSkill);
router.put("/skills/:name", requireAuth, requireVerifiedEmail, updateSkill);
router.delete("/skills/:name", requireAuth, requireVerifiedEmail, deleteSkill);

router.post("/experience", requireAuth, requireVerifiedEmail, addExperience);
router.put("/experience/:id", requireAuth, requireVerifiedEmail, updateExperience);
router.delete("/experience/:id", requireAuth, requireVerifiedEmail, deleteExperience);

router.post("/education", requireAuth, requireVerifiedEmail, addEducation);
router.put("/education/:id", requireAuth, requireVerifiedEmail, updateEducation);
router.delete("/education/:id", requireAuth, requireVerifiedEmail, deleteEducation);

export default router;
