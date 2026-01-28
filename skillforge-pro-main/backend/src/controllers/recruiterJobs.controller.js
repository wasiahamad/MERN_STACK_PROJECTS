import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { Job } from "../models/Job.js";

function asNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    skills,
    minAiScore,
    requiredCertificates,
  } = req.body || {};

  if (!title || !location || !type || !description) {
    throw new ApiError(400, "VALIDATION", "title, location, type, description are required");
  }

  if (!Array.isArray(skills) || skills.length < 1) {
    throw new ApiError(400, "VALIDATION", "skills must be a non-empty array");
  }

  const sMin = asNumber(salaryMin);
  const sMax = asNumber(salaryMax);
  if (sMin === null || sMax === null || sMin < 0 || sMax < 0 || sMax < sMin) {
    throw new ApiError(400, "VALIDATION", "Invalid salary range");
  }

  const ai = minAiScore === null || minAiScore === undefined ? null : asNumber(minAiScore);
  if (ai !== null && (ai < 0 || ai > 100)) {
    throw new ApiError(400, "VALIDATION", "minAiScore must be between 0 and 100");
  }

  const certs = Array.isArray(requiredCertificates) ? requiredCertificates : [];

  const job = await Job.create({
    recruiterId: req.user._id,
    title: String(title),
    location: String(location),
    type: String(type),
    salaryMin: sMin,
    salaryMax: sMax,
    experience: typeof experience === "string" ? experience : "",
    description: String(description),
    skills: skills.map((x) => String(x)),
    minAiScore: ai,
    requiredCertificates: certs.map((x) => String(x)),

    companyName: req.recruiterProfile?.companyName || "",
    companyWebsite: req.recruiterProfile?.website || "",
    companyLogo: req.recruiterProfile?.logo || "",
    industry: req.recruiterProfile?.industry || "",
    companySize: req.recruiterProfile?.size || "",
  });

  return created(
    res,
    {
      job: {
        id: String(job._id),
        title: job.title,
        location: job.location,
        type: job.type,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experience: job.experience,
        description: job.description,
        skills: job.skills,
        minAiScore: job.minAiScore,
        requiredCertificates: job.requiredCertificates,
        status: job.status,
        companyName: job.companyName,
        companyWebsite: job.companyWebsite,
        companyLogo: job.companyLogo,
        industry: job.industry,
        companySize: job.companySize,
        createdAt: job.createdAt,
      },
    },
    "Job created"
  );
});

export const listJobs = asyncHandler(async (req, res) => {
  const { status, search, page = 1, pageSize = 10 } = req.query || {};

  const q = { recruiterId: req.user._id };
  if (status && ["active", "paused", "closed"].includes(String(status))) {
    q.status = String(status);
  }

  if (search) {
    q.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { location: { $regex: String(search), $options: "i" } },
    ];
  }

  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(pageSize) || 10));

  const [items, total] = await Promise.all([
    Job.find(q).sort({ createdAt: -1 }).skip((p - 1) * ps).limit(ps),
    Job.countDocuments(q),
  ]);

  return ok(
    res,
    {
      items: items.map((job) => ({
        id: String(job._id),
        title: job.title,
        location: job.location,
        type: job.type,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        status: job.status,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        createdAt: job.createdAt,
      })),
      total,
      page: p,
      pageSize: ps,
    },
    "Recruiter jobs"
  );
});
