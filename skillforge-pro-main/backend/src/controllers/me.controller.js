import path from "path";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { RecruiterProfile } from "../models/RecruiterProfile.js";
import { uploadImageBuffer } from "../utils/cloudinary.js";
import { Job } from "../models/Job.js";

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
    settings: user.settings || undefined,
    aiScore: user.aiScore ?? undefined,
    reputation: user.reputation ?? undefined,
    skills: Array.isArray(user.skills) ? user.skills.map(mapSkill) : undefined,
    experience: Array.isArray(user.experience) ? user.experience.map(mapExperience) : undefined,
    education: Array.isArray(user.education) ? user.education.map(mapEducation) : undefined,
    certificates: Array.isArray(user.certificates) ? user.certificates.map(mapCertificate) : undefined,
    savedJobIds: Array.isArray(user.savedJobs) ? user.savedJobs.map((x) => String(x)) : undefined,
    emailVerified: !!user.emailVerified,
  };
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function asNumber(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapSavedJob(job) {
  return {
    id: String(job._id),
    title: job.title,
    company: job.companyName || "",
    logo: job.companyLogo || "",
    location: job.location,
    type: job.type,
    salary:
      asNumber(job.salaryMin) != null && asNumber(job.salaryMax) != null
        ? `₹${inr.format(asNumber(job.salaryMin))} - ₹${inr.format(asNumber(job.salaryMax))}`
        : "",
    posted: job.createdAt,
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    skills: job.skills,
    minAiScore: job.minAiScore ?? 0,
    requiredCertificates: job.requiredCertificates || [],
    verified: true,
    applicants: 0,
    views: typeof job.views === "number" ? job.views : 0,
  };
}

export const listSavedJobs = asyncHandler(async (req, res) => {
  if (req.user?.role !== "candidate") throw new ApiError(403, "FORBIDDEN", "Candidate only");

  const ids = Array.isArray(req.user.savedJobs) ? req.user.savedJobs : [];
  if (!ids.length) return ok(res, { items: [] }, "Saved jobs");

  const jobs = await Job.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  const byId = new Map(jobs.map((j) => [String(j._id), j]));

  // Preserve user's saved ordering as much as possible
  const ordered = ids.map((x) => byId.get(String(x))).filter(Boolean);
  return ok(res, { items: ordered.map(mapSavedJob) }, "Saved jobs");
});

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
    settings,
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

  if (settings && typeof settings === "object") {
    if (typeof settings.darkMode === "boolean") {
      req.user.settings.darkMode = settings.darkMode;
    }
    if (typeof settings.language === "string") {
      req.user.settings.language = settings.language;
    }
    if (settings.notifications && typeof settings.notifications === "object") {
      const n = settings.notifications;
      if (typeof n.email === "boolean") req.user.settings.notifications.email = n.email;
      if (typeof n.push === "boolean") req.user.settings.notifications.push = n.push;
      if (typeof n.applicationUpdates === "boolean") req.user.settings.notifications.applicationUpdates = n.applicationUpdates;
      if (typeof n.jobMatches === "boolean") req.user.settings.notifications.jobMatches = n.jobMatches;
      if (typeof n.securityAlerts === "boolean") req.user.settings.notifications.securityAlerts = n.securityAlerts;
    }
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

  // multer is configured with memoryStorage() for this route
  const buffer = req.file.buffer;
  if (!buffer) throw new ApiError(400, "VALIDATION", "avatar buffer is required");

  const upload = await uploadImageBuffer(buffer, {
    public_id: `user_${String(req.user._id)}`,
    transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
  });

  const avatarUrl = upload?.secure_url || upload?.url;
  if (!avatarUrl) throw new ApiError(500, "AVATAR_UPLOAD_FAILED", "Unable to upload avatar");

  req.user.avatar = String(avatarUrl);
  await req.user.save();

  return ok(res, { avatar: avatarUrl, user: mapUser(req.user) }, "Avatar uploaded");
});

function requireCandidate(user) {
  if (user?.role !== "candidate") {
    throw new ApiError(403, "FORBIDDEN", "Candidate only");
  }
}

export const addSkill = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { name, level, verified } = req.body || {};
  const normalizedName = String(name || "").trim();
  if (!normalizedName) throw new ApiError(400, "VALIDATION", "name is required");

  const nLevel = Number(level);
  if (!Number.isFinite(nLevel) || nLevel < 0 || nLevel > 100) {
    throw new ApiError(400, "VALIDATION", "level must be 0..100");
  }

  const idx = (req.user.skills || []).findIndex((s) => String(s.name).toLowerCase() === normalizedName.toLowerCase());
  if (idx >= 0) {
    req.user.skills[idx].name = normalizedName;
    req.user.skills[idx].level = nLevel;
    if (verified !== undefined) req.user.skills[idx].verified = !!verified;
  } else {
    req.user.skills.push({ name: normalizedName, level: nLevel, verified: !!verified });
  }

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Skill saved");
});

export const updateSkill = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { name } = req.params;
  const { level, verified, newName } = req.body || {};

  const key = String(name || "").trim();
  if (!key) throw new ApiError(400, "VALIDATION", "name is required");

  const idx = (req.user.skills || []).findIndex((s) => String(s.name).toLowerCase() === key.toLowerCase());
  if (idx < 0) throw new ApiError(404, "SKILL_NOT_FOUND", "Skill not found");

  if (newName !== undefined) {
    const nn = String(newName || "").trim();
    if (!nn) throw new ApiError(400, "VALIDATION", "newName cannot be empty");
    req.user.skills[idx].name = nn;
  }

  if (level !== undefined) {
    const nLevel = Number(level);
    if (!Number.isFinite(nLevel) || nLevel < 0 || nLevel > 100) {
      throw new ApiError(400, "VALIDATION", "level must be 0..100");
    }
    req.user.skills[idx].level = nLevel;
  }

  if (verified !== undefined) req.user.skills[idx].verified = !!verified;

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Skill updated");
});

export const deleteSkill = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { name } = req.params;
  const key = String(name || "").trim();
  if (!key) throw new ApiError(400, "VALIDATION", "name is required");

  const before = req.user.skills?.length || 0;
  req.user.skills = (req.user.skills || []).filter((s) => String(s.name).toLowerCase() !== key.toLowerCase());
  if ((req.user.skills?.length || 0) === before) {
    throw new ApiError(404, "SKILL_NOT_FOUND", "Skill not found");
  }

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Skill deleted");
});

export const addExperience = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { title, company, location, startDate, endDate, current, description } = req.body || {};
  if (!title || !company || !location || !startDate) {
    throw new ApiError(400, "VALIDATION", "title, company, location, startDate are required");
  }

  req.user.experience.push({
    title: String(title),
    company: String(company),
    location: String(location),
    startDate: String(startDate),
    endDate: endDate ? String(endDate) : undefined,
    current: !!current,
    description: typeof description === "string" ? description : "",
  });

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Experience added");
});

export const updateExperience = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { id } = req.params;
  const exp = (req.user.experience || []).id(id);
  if (!exp) throw new ApiError(404, "EXPERIENCE_NOT_FOUND", "Experience not found");

  const { title, company, location, startDate, endDate, current, description } = req.body || {};
  if (title !== undefined) exp.title = String(title);
  if (company !== undefined) exp.company = String(company);
  if (location !== undefined) exp.location = String(location);
  if (startDate !== undefined) exp.startDate = String(startDate);
  if (endDate !== undefined) exp.endDate = endDate ? String(endDate) : "";
  if (current !== undefined) exp.current = !!current;
  if (description !== undefined) exp.description = typeof description === "string" ? description : "";

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Experience updated");
});

export const deleteExperience = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { id } = req.params;
  const exp = (req.user.experience || []).id(id);
  if (!exp) throw new ApiError(404, "EXPERIENCE_NOT_FOUND", "Experience not found");
  exp.deleteOne();
  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Experience deleted");
});

export const addEducation = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { degree, institution, year, gpa } = req.body || {};
  if (!degree || !institution || !year) {
    throw new ApiError(400, "VALIDATION", "degree, institution, year are required");
  }

  req.user.education.push({
    degree: String(degree),
    institution: String(institution),
    year: String(year),
    gpa: gpa ? String(gpa) : undefined,
  });

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Education added");
});

export const updateEducation = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { id } = req.params;
  const edu = (req.user.education || []).id(id);
  if (!edu) throw new ApiError(404, "EDUCATION_NOT_FOUND", "Education not found");

  const { degree, institution, year, gpa } = req.body || {};
  if (degree !== undefined) edu.degree = String(degree);
  if (institution !== undefined) edu.institution = String(institution);
  if (year !== undefined) edu.year = String(year);
  if (gpa !== undefined) edu.gpa = gpa ? String(gpa) : "";

  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Education updated");
});

export const deleteEducation = asyncHandler(async (req, res) => {
  requireCandidate(req.user);
  const { id } = req.params;
  const edu = (req.user.education || []).id(id);
  if (!edu) throw new ApiError(404, "EDUCATION_NOT_FOUND", "Education not found");
  edu.deleteOne();
  await req.user.save();
  return ok(res, { user: mapUser(req.user) }, "Education deleted");
});
