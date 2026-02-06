import express from "express";
import multer from "multer";

import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import {
  getMe,
  updateMe,
  uploadAvatar,
  listSavedJobs,
  getWalletNonce,
  linkWallet,
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
import { refreshMyAiScore } from "../controllers/aiScore.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype || "");
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

router.get("/", requireAuth, requireVerifiedEmail, getMe);
router.get("/wallet/nonce", requireAuth, requireVerifiedEmail, getWalletNonce);
router.post("/wallet/link", requireAuth, requireVerifiedEmail, linkWallet);
router.get("/saved-jobs", requireAuth, requireVerifiedEmail, listSavedJobs);
router.put("/", requireAuth, requireVerifiedEmail, updateMe);
router.post("/avatar", requireAuth, requireVerifiedEmail, upload.single("avatar"), uploadAvatar);

// Candidate AI score
router.post("/ai-score/refresh", requireAuth, requireVerifiedEmail, refreshMyAiScore);

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
