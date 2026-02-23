import express from "express";

import {
  signup,
  verifyEmailOtp,
  resendEmailOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  adminLogin,
} from "../controllers/auth.controller.js";
import { me } from "../controllers/authMe.controller.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiters.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", otpLimiter, signup);
router.post("/verify-email-otp", otpLimiter, verifyEmailOtp);
router.post("/resend-email-otp", otpLimiter, resendEmailOtp);

router.post("/login", authLimiter, login);
router.post("/admin/login", authLimiter, adminLogin);

router.get("/me", requireAuth, me);

router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-reset-otp", otpLimiter, verifyResetOtp);
router.post("/reset-password", otpLimiter, resetPassword);

export default router;
