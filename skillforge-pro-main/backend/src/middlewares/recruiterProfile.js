import { ApiError } from "../utils/ApiError.js";
import { RecruiterProfile } from "../models/RecruiterProfile.js";

export async function requireRecruiterProfileComplete(req, res, next) {
  const profile = await RecruiterProfile.findOne({ userId: req.user._id });
  if (!profile || !profile.isComplete) {
    return next(
      new ApiError(
        403,
        "RECRUITER_PROFILE_INCOMPLETE",
        "Recruiter profile must be completed before posting jobs"
      )
    );
  }
  req.recruiterProfile = profile;
  return next();
}
