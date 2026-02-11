import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

function mapSettings(user) {
  const s = user.settings || {};
  const n = s.notifications || {};

  return {
    darkMode: !!s.darkMode,
    language: s.language || "en-US",
    twoFactorEnabled: !!s.twoFactorEnabled,
    notifications: {
      email: n.email ?? true,
      push: n.push ?? false,
      applicationUpdates: n.applicationUpdates ?? true,
      jobMatches: n.jobMatches ?? true,
      securityAlerts: n.securityAlerts ?? true,
    },
  };
}

export const getSettings = asyncHandler(async (req, res) => {
  return ok(res, { settings: mapSettings(req.user) }, "Settings");
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { darkMode, language, twoFactorEnabled, notifications } = req.body || {};

  if (darkMode !== undefined) req.user.settings.darkMode = !!darkMode;

  if (language !== undefined) {
    const v = String(language).trim();
    if (v.length < 2 || v.length > 20) throw new ApiError(400, "VALIDATION", "language must be 2..20 chars");
    req.user.settings.language = v;
  }

  if (twoFactorEnabled !== undefined) req.user.settings.twoFactorEnabled = !!twoFactorEnabled;

  if (notifications && typeof notifications === "object") {
    const dst = req.user.settings.notifications;
    if (notifications.email !== undefined) dst.email = !!notifications.email;
    if (notifications.push !== undefined) dst.push = !!notifications.push;
    if (notifications.applicationUpdates !== undefined) dst.applicationUpdates = !!notifications.applicationUpdates;
    if (notifications.jobMatches !== undefined) dst.jobMatches = !!notifications.jobMatches;
    if (notifications.securityAlerts !== undefined) dst.securityAlerts = !!notifications.securityAlerts;
  }

  await req.user.save();

  return ok(res, { settings: mapSettings(req.user) }, "Settings updated");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "VALIDATION", "currentPassword and newPassword are required");
  }

  const user = await User.findById(req.user._id).select("+password +tokenInvalidBefore");
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");

  const okPass = await user.comparePassword(String(currentPassword));
  if (!okPass) throw new ApiError(400, "INVALID_CREDENTIALS", "Current password is incorrect");

  const np = String(newPassword);
  if (np.length < 8) throw new ApiError(400, "VALIDATION", "newPassword must be at least 8 characters");

  user.password = np;
  user.tokenInvalidBefore = new Date();
  await user.save();

  return ok(res, { ok: true }, "Password changed. Please login again.");
});

export const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = Array.isArray(req.user.activeSessions) ? req.user.activeSessions : [];
  const mapped = sessions.map((s) => ({
    id: String(s._id),
    device: s.device || "Unknown Device",
    location: s.location || "Unknown Location",
    ip: s.ip || "",
    lastActive: s.lastActive || s.createdAt,
    createdAt: s.createdAt,
  }));
  return ok(res, { sessions: mapped }, "Active sessions");
});

export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) throw new ApiError(400, "VALIDATION", "sessionId is required");

  const sessions = Array.isArray(req.user.activeSessions) ? req.user.activeSessions : [];
  req.user.activeSessions = sessions.filter((s) => String(s._id) !== sessionId);
  await req.user.save();

  return ok(res, { ok: true }, "Session revoked");
});

export const getWalletStats = asyncHandler(async (req, res) => {
  const certs = Array.isArray(req.user.certificates) ? req.user.certificates : [];
  const nftCount = certs.filter((c) => c.nftMinted).length;
  const verifiedCount = certs.filter((c) => c.verified).length;
  const transactionCount = certs.filter((c) => c.chainTxHash).length;

  return ok(
    res,
    {
      walletAddress: req.user.walletAddress || null,
      walletVerified: !!req.user.walletVerifiedAt,
      nftCertificates: nftCount,
      verifiedCertificates: verifiedCount,
      transactions: transactionCount,
      reputation: req.user.reputation ?? 0,
    },
    "Wallet stats"
  );
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { confirmPassword } = req.body || {};
  if (!confirmPassword) throw new ApiError(400, "VALIDATION", "confirmPassword is required");

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");

  const okPass = await user.comparePassword(String(confirmPassword));
  if (!okPass) throw new ApiError(400, "INVALID_CREDENTIALS", "Password is incorrect");

  // Soft delete
  user.deletedAt = new Date();
  user.tokenInvalidBefore = new Date();
  await user.save();

  return ok(res, { ok: true }, "Account deleted. You will be logged out.");
});
