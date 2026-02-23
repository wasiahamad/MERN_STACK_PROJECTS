import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { randomOtp6, hashOtp } from "../utils/crypto.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { signAuthToken } from "../utils/jwt.js";

import { User } from "../models/User.js";

function otpExpiryDate() {
  const ttlMs = env.OTP_TTL_MINUTES * 60 * 1000;
  return new Date(Date.now() + ttlMs);
}

export const signup = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password || !role) {
    throw new ApiError(400, "VALIDATION", "email, password, role are required");
  }

  if (!["candidate", "recruiter"].includes(role)) {
    throw new ApiError(400, "VALIDATION", "Invalid role");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // If a verified user exists, block signup.
  const existingUser = await User.findOne({ email: normalizedEmail }).select(
    "+otpHash +otpExpiry +otpAttempts +otpResendCount"
  );
  if (existingUser?.emailVerified) {
    throw new ApiError(409, "EMAIL_IN_USE", "Email is already registered");
  }

  const otp = randomOtp6();
  const otpHash = hashOtp(otp);
  const expiry = otpExpiryDate();

  const user =
    existingUser ||
    new User({
      email: normalizedEmail,
      role,
      emailVerified: false,
    });

  user.password = String(password);
  user.role = role;
  user.emailVerified = false;
  user.otpHash = otpHash;
  user.otpExpiry = expiry;
  user.otpAttempts = 0;
  user.otpResendCount = existingUser?.otpResendCount || 0;

  await user.save();

  if (env.NODE_ENV !== "production") {
    void sendOtpEmail({ to: normalizedEmail, otp, purpose: "signup" }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log("[DEV OTP FALLBACK] Signup OTP for", normalizedEmail, otp);
      // eslint-disable-next-line no-console
      console.log("[DEV EMAIL ERROR]", err?.message || err);
    });
  } else {
    await sendOtpEmail({ to: normalizedEmail, otp, purpose: "signup" });
  }

  return created(
    res,
    {
      email: normalizedEmail,
      otpExpiresInMinutes: env.OTP_TTL_MINUTES,
    },
    "OTP sent to email"
  );
});

export const resendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) throw new ApiError(400, "VALIDATION", "email is required");

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+otpHash +otpExpiry +otpAttempts +otpResendCount"
  );
  if (!user || user.emailVerified) {
    throw new ApiError(404, "PENDING_NOT_FOUND", "No pending signup found for this email");
  }

  if (user.otpResendCount >= env.OTP_RESEND_MAX) {
    throw new ApiError(429, "OTP_RESEND_LIMIT", "Resend limit reached");
  }

  const otp = randomOtp6();
  user.otpHash = hashOtp(otp);
  user.otpExpiry = otpExpiryDate();
  user.otpAttempts = 0;
  user.otpResendCount += 1;
  await user.save();

  if (env.NODE_ENV !== "production") {
    void sendOtpEmail({ to: normalizedEmail, otp, purpose: "signup" }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log("[DEV OTP FALLBACK] Resend signup OTP for", normalizedEmail, otp);
      // eslint-disable-next-line no-console
      console.log("[DEV EMAIL ERROR]", err?.message || err);
    });
  } else {
    await sendOtpEmail({ to: normalizedEmail, otp, purpose: "signup" });
  }

  return ok(
    res,
    { email: normalizedEmail, otpExpiresInMinutes: env.OTP_TTL_MINUTES, resendCount: user.otpResendCount },
    "OTP resent"
  );
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body || {};
  if (!email || !otp) {
    throw new ApiError(400, "VALIDATION", "email and otp are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+otpHash +otpExpiry +otpAttempts +otpResendCount"
  );
  if (!user || user.emailVerified) {
    throw new ApiError(404, "PENDING_NOT_FOUND", "No pending signup found");
  }

  if (!user.otpHash || !user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
    throw new ApiError(400, "OTP_EXPIRED", "OTP has expired");
  }

  if (user.otpAttempts >= env.OTP_VERIFY_MAX_ATTEMPTS) {
    throw new ApiError(429, "OTP_ATTEMPTS_EXCEEDED", "Too many OTP attempts. Please resend OTP.");
  }

  const match = user.otpHash === hashOtp(String(otp));
  if (!match) {
    user.otpAttempts += 1;
    await user.save();
    throw new ApiError(400, "OTP_INVALID", "Invalid OTP");
  }

  user.emailVerified = true;
  user.otpHash = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  user.otpResendCount = 0;

  if (name) user.name = String(name);
  await user.save();

  const token = signAuthToken(user);

  return created(
    res,
    {
      token,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        name: user.name,
        phone: user.phone,
      },
    },
    "Email verified"
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new ApiError(400, "VALIDATION", "email and password are required");

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

  if (!user.emailVerified) {
    throw new ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email");
  }

  const okPass = await user.comparePassword(String(password));
  if (!okPass) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

  const token = signAuthToken(user);

  return ok(
    res,
    {
      token,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        name: user.name,
        phone: user.phone,
      },
    },
    "Logged in"
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) throw new ApiError(400, "VALIDATION", "email is required");

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+resetOtpHash +resetOtpExpiry +resetOtpUsed +resetOtpAttempts"
  );

  // Do not leak user existence
  if (!user) {
    return ok(res, { email: normalizedEmail }, "If this email exists, an OTP was sent");
  }

  const otp = randomOtp6();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpiry = otpExpiryDate();
  user.resetOtpUsed = false;
  user.resetOtpAttempts = 0;
  await user.save();

  if (env.NODE_ENV !== "production") {
    void sendOtpEmail({ to: normalizedEmail, otp, purpose: "reset" }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log("[DEV OTP FALLBACK] Reset OTP for", normalizedEmail, otp);
      // eslint-disable-next-line no-console
      console.log("[DEV EMAIL ERROR]", err?.message || err);
    });
  } else {
    await sendOtpEmail({ to: normalizedEmail, otp, purpose: "reset" });
  }

  return ok(res, { email: normalizedEmail, otpExpiresInMinutes: env.OTP_TTL_MINUTES }, "Reset OTP sent");
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) throw new ApiError(400, "VALIDATION", "email and otp are required");

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+resetOtpHash +resetOtpExpiry +resetOtpUsed +resetOtpAttempts"
  );
  if (!user) throw new ApiError(400, "OTP_INVALID", "Invalid OTP");

  if (!user.resetOtpHash || !user.resetOtpExpiry || user.resetOtpExpiry.getTime() < Date.now()) {
    throw new ApiError(400, "OTP_EXPIRED", "OTP expired");
  }

  if (user.resetOtpUsed) {
    throw new ApiError(400, "OTP_USED", "OTP already used");
  }

  if (user.resetOtpAttempts >= env.OTP_VERIFY_MAX_ATTEMPTS) {
    throw new ApiError(429, "OTP_ATTEMPTS_EXCEEDED", "Too many OTP attempts. Request a new OTP.");
  }

  const match = user.resetOtpHash === hashOtp(String(otp));
  if (!match) {
    user.resetOtpAttempts += 1;
    await user.save();
    throw new ApiError(400, "OTP_INVALID", "Invalid OTP");
  }

  return ok(res, { email: normalizedEmail, valid: true }, "OTP verified");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body || {};
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "VALIDATION", "email, otp, newPassword are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+resetOtpHash +resetOtpExpiry +resetOtpUsed +resetOtpAttempts +tokenInvalidBefore"
  );
  if (!user) throw new ApiError(400, "OTP_INVALID", "Invalid OTP");

  if (!user.resetOtpHash || !user.resetOtpExpiry || user.resetOtpExpiry.getTime() < Date.now()) {
    throw new ApiError(400, "OTP_EXPIRED", "OTP expired");
  }

  if (user.resetOtpUsed) {
    throw new ApiError(400, "OTP_USED", "OTP already used");
  }

  if (user.resetOtpAttempts >= env.OTP_VERIFY_MAX_ATTEMPTS) {
    throw new ApiError(429, "OTP_ATTEMPTS_EXCEEDED", "Too many OTP attempts. Request a new OTP.");
  }

  const match = user.resetOtpHash === hashOtp(String(otp));
  if (!match) {
    user.resetOtpAttempts += 1;
    await user.save();
    throw new ApiError(400, "OTP_INVALID", "Invalid OTP");
  }

  user.password = String(newPassword);
  user.resetOtpUsed = true;
  user.resetOtpHash = undefined;
  user.resetOtpExpiry = undefined;
  user.resetOtpAttempts = 0;

  // Invalidate old JWT sessions
  user.tokenInvalidBefore = new Date();

  await user.save();

  return ok(res, { ok: true }, "Password reset successful");
});

// Admin login (no OTP, no registration)
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new ApiError(400, "VALIDATION", "email and password are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail, role: "admin" }).select("+password");
  
  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid admin credentials");
  }

  const okPass = await user.comparePassword(String(password));
  if (!okPass) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid admin credentials");
  }

  const token = signAuthToken(user);

  return ok(
    res,
    {
      token,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      },
    },
    "Admin logged in"
  );
});
