import path from "path";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { RecruiterProfile, computeRecruiterProfileComplete } from "../models/RecruiterProfile.js";
import { User } from "../models/User.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user._id });

  return ok(
    res,
    {
      user: {
        id: String(req.user._id),
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
      },
      profile: profile
        ? {
            companyName: profile.companyName,
            website: profile.website,
            industry: profile.industry,
            size: profile.size,
            about: profile.about,
            logo: profile.logo,
            location: profile.location,
            isComplete: profile.isComplete,
          }
        : null,
    },
    "Recruiter profile"
  );
});

export const upsertProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    companyName,
    website,
    industry,
    size,
    about,
    location,
  } = req.body || {};

  // Update user fields
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

  if (typeof name === "string") user.name = name;
  if (typeof phone === "string") user.phone = phone;
  await user.save();

  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        companyName: typeof companyName === "string" ? companyName : undefined,
        website: typeof website === "string" ? website : undefined,
        industry: typeof industry === "string" ? industry : undefined,
        size: typeof size === "string" ? size : undefined,
        about: typeof about === "string" ? about : undefined,
        location: typeof location === "string" ? location : undefined,
      },
      $setOnInsert: { userId: user._id },
    },
    { upsert: true, new: true }
  );

  profile.isComplete = computeRecruiterProfileComplete({ user, profile });
  await profile.save();

  return ok(
    res,
    {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      profile: {
        companyName: profile.companyName,
        website: profile.website,
        industry: profile.industry,
        size: profile.size,
        about: profile.about,
        logo: profile.logo,
        location: profile.location,
        isComplete: profile.isComplete,
      },
    },
    "Profile updated"
  );
});

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "VALIDATION", "logo file is required");

  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { logo: path.posix.join("/uploads", req.file.filename) }, $setOnInsert: { userId: req.user._id } },
    { upsert: true, new: true }
  );

  profile.isComplete = computeRecruiterProfileComplete({ user: req.user, profile });
  await profile.save();

  return ok(res, { logo: profile.logo, isComplete: profile.isComplete }, "Logo uploaded");
});
