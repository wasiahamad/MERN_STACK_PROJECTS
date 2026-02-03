import mongoose from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";

function asNumber(v) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function ensureOwner(job, userId) {
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (String(job.recruiterId) !== String(userId)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }
}

function mapRecruiterJob(job) {
  return {
    id: String(job._id),
    title: job.title,
    location: job.location,
    type: job.type,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    experience: job.experience,
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    skills: job.skills,
    minAiScore: job.minAiScore,
    requiredCertificates: job.requiredCertificates,
    status: job.status,
    views: typeof job.views === "number" ? job.views : 0,
    companyName: job.companyName,
    companyWebsite: job.companyWebsite,
    companyLogo: job.companyLogo,
    industry: job.industry,
    companySize: job.companySize,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
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
    requirements,
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
  const reqs = Array.isArray(requirements) ? requirements : [];

  const job = await Job.create({
    recruiterId: req.user._id,
    title: String(title),
    location: String(location),
    type: String(type),
    salaryMin: sMin,
    salaryMax: sMax,
    experience: typeof experience === "string" ? experience : "",
    description: String(description),
    requirements: reqs.map((x) => String(x)).filter(Boolean),
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
      job: mapRecruiterJob(job),
    },
    "Job created"
  );
});

export const getJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);
  return ok(res, { job: mapRecruiterJob(job) }, "Recruiter job");
});

export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);

  const {
    title,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    requirements,
    skills,
    minAiScore,
    requiredCertificates,
    status,
  } = req.body || {};

  if (title !== undefined) job.title = String(title);
  if (location !== undefined) job.location = String(location);
  if (type !== undefined) job.type = String(type);
  if (experience !== undefined) job.experience = typeof experience === "string" ? experience : String(experience);
  if (description !== undefined) job.description = String(description);

  if (requirements !== undefined) {
    const reqs = Array.isArray(requirements) ? requirements : [];
    job.requirements = reqs.map((x) => String(x)).filter(Boolean);
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || skills.length < 1) {
      throw new ApiError(400, "VALIDATION", "skills must be a non-empty array");
    }
    job.skills = skills.map((x) => String(x));
  }

  // Salary update must preserve a valid range
  const sMin = salaryMin === undefined ? job.salaryMin : asNumber(salaryMin);
  const sMax = salaryMax === undefined ? job.salaryMax : asNumber(salaryMax);
  if (sMin === null || sMax === null || sMin < 0 || sMax < 0 || sMax < sMin) {
    throw new ApiError(400, "VALIDATION", "Invalid salary range");
  }
  job.salaryMin = sMin;
  job.salaryMax = sMax;

  if (minAiScore !== undefined) {
    const ai = minAiScore === null ? null : asNumber(minAiScore);
    if (ai !== null && (ai < 0 || ai > 100)) {
      throw new ApiError(400, "VALIDATION", "minAiScore must be between 0 and 100");
    }
    job.minAiScore = ai;
  }

  if (requiredCertificates !== undefined) {
    const certs = Array.isArray(requiredCertificates) ? requiredCertificates : [];
    job.requiredCertificates = certs.map((x) => String(x));
  }

  if (status !== undefined) {
    const st = String(status);
    if (!["active", "paused", "closed"].includes(st)) {
      throw new ApiError(400, "VALIDATION", "status must be one of active|paused|closed");
    }
    job.status = st;
  }

  await job.save();
  return ok(res, { job: mapRecruiterJob(job) }, "Job updated");
});

export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);
  await Job.deleteOne({ _id: job._id });
  return ok(res, { ok: true }, "Job deleted");
});

export const listJobs = asyncHandler(async (req, res) => {
  const { status, search, page = 1, pageSize = 10, limit } = req.query || {};

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
  const ps = Math.min(50, Math.max(1, Number(limit ?? pageSize) || 10));

  const [items, total] = await Promise.all([
    Job.find(q).sort({ createdAt: -1 }).skip((p - 1) * ps).limit(ps),
    Job.countDocuments(q),
  ]);

  const jobIds = items.map((j) => j._id).filter(Boolean);
  const grouped = jobIds.length
    ? await Application.aggregate([
        {
          $match: {
            recruiterId: new mongoose.Types.ObjectId(String(req.user._id)),
            jobId: { $in: jobIds },
          },
        },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ])
    : [];

  const applicantsByJobId = new Map(grouped.map((r) => [String(r._id), Number(r.count || 0)]));

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
        experience: job.experience,
        skills: job.skills,
        status: job.status,
        applicantsCount: applicantsByJobId.get(String(job._id)) || 0,
        views: typeof job.views === "number" ? job.views : 0,
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
