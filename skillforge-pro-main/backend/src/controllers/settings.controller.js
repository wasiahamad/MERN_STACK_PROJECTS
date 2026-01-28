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
  const { darkMode, language, notifications } = req.body || {};

  if (darkMode !== undefined) req.user.settings.darkMode = !!darkMode;

  if (language !== undefined) {
    const v = String(language).trim();
    if (v.length < 2 || v.length > 20) throw new ApiError(400, "VALIDATION", "language must be 2..20 chars");
    req.user.settings.language = v;
  }

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
