import path from "path";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { RecruiterProfile } from "../models/RecruiterProfile.js";

function mapSkill(s) {
  return { name: s.name, level: s.level, verified: !!s.verified };
}

function mapExperience(e) {
  return {
    id: String(e._id),
    title: e.title,
    company: e.company,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate || undefined,
    current: !!e.current,
    description: e.description,
  };
}

function mapEducation(e) {
  return {
    id: String(e._id),
    degree: e.degree,
    institution: e.institution,
    year: e.year,
    gpa: e.gpa || undefined,
  };
}

function mapCertificate(c) {
  return {
    id: String(c._id),
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    nftMinted: !!c.nftMinted,
    tokenId: c.tokenId || undefined,
    image: c.image,
    verified: !!c.verified,
  };
}

function mapUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    phone: user.phone,
    walletAddress: user.walletAddress || undefined,
    headline: user.headline || undefined,
    location: user.location || undefined,
    about: user.about || undefined,
    socials: user.socials || undefined,
    aiScore: user.aiScore ?? undefined,
    reputation: user.reputation ?? undefined,
    skills: Array.isArray(user.skills) ? user.skills.map(mapSkill) : undefined,
    experience: Array.isArray(user.experience) ? user.experience.map(mapExperience) : undefined,
    education: Array.isArray(user.education) ? user.education.map(mapEducation) : undefined,
    certificates: Array.isArray(user.certificates) ? user.certificates.map(mapCertificate) : undefined,
    emailVerified: !!user.emailVerified,
  };
}

export const getMe = asyncHandler(async (req, res) => {
  const base = mapUser(req.user);

  if (req.user.role === "recruiter") {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id });
    return ok(
      res,
      {
        user: base,
        recruiterProfile: profile
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
      "Me"
    );
  }

  return ok(res, { user: base }, "Me");
});

export const updateMe = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    avatar,
    walletAddress,
    headline,
    location,
    about,
    socials,
    aiScore,
    reputation,
    skills,
    experience,
    education,
    certificates,
  } = req.body || {};

  if (typeof name === "string") req.user.name = name;
  if (typeof phone === "string") req.user.phone = phone;
  if (typeof avatar === "string") req.user.avatar = avatar;
  if (typeof walletAddress === "string") req.user.walletAddress = walletAddress;
  if (typeof headline === "string") req.user.headline = headline;
  if (typeof location === "string") req.user.location = location;
  if (typeof about === "string") req.user.about = about;
  if (socials && typeof socials === "object") {
    req.user.socials = {
      github: typeof socials.github === "string" ? socials.github : req.user.socials?.github,
      linkedin: typeof socials.linkedin === "string" ? socials.linkedin : req.user.socials?.linkedin,
      website: typeof socials.website === "string" ? socials.website : req.user.socials?.website,
    };
  }

  // Candidate-only fields (frontend uses these)
  if (req.user.role === "candidate") {
    if (aiScore !== undefined) {
      const n = Number(aiScore);
      if (!Number.isFinite(n) || n < 0 || n > 100) throw new ApiError(400, "VALIDATION", "aiScore must be 0..100");
      req.user.aiScore = n;
    }
    if (reputation !== undefined) {
      const n = Number(reputation);
      if (!Number.isFinite(n) || n < 0 || n > 100)
        throw new ApiError(400, "VALIDATION", "reputation must be 0..100");
      req.user.reputation = n;
    }

    // For now: allow replacing arrays whole (simple contract for UI)
    if (Array.isArray(skills)) req.user.skills = skills;
    if (Array.isArray(experience)) req.user.experience = experience;
    if (Array.isArray(education)) req.user.education = education;
    if (Array.isArray(certificates)) req.user.certificates = certificates;
  }

  await req.user.save();

  return ok(res, { user: mapUser(req.user) }, "Profile updated");
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "VALIDATION", "avatar file is required");

  const avatarUrl = path.posix.join("/uploads", req.file.filename);
  req.user.avatar = avatarUrl;
  await req.user.save();

  return ok(res, { avatar: avatarUrl }, "Avatar uploaded");
});
