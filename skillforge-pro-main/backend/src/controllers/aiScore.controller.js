import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { applyCandidateAiScoreToUserDoc } from "../utils/aiScore.js";

export const refreshMyAiScore = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  if (req.user.role !== "candidate") throw new ApiError(403, "FORBIDDEN", "Candidate only");

  // Reload full user doc to avoid using a potentially stale req.user snapshot.
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

  const { aiScore, breakdown } = await applyCandidateAiScoreToUserDoc(user);
  await user.save();

  return ok(res, { aiScore, breakdown }, "AI score refreshed");
});
