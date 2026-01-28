import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/Job.js";

function formatSalary(job) {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `$${job.salaryMin} - $${job.salaryMax}`;
  }
  return "";
}

function mapJobList(job) {
  return {
    id: String(job._id),
    title: job.title,
    company: job.companyName || "",
    logo: job.companyLogo || "",
    location: job.location,
    type: job.type,
    salary: formatSalary(job),
    posted: job.createdAt,
    description: job.description,
    requirements: [],
    skills: job.skills,
    minAiScore: job.minAiScore ?? 0,
    requiredCertificates: job.requiredCertificates || [],
    verified: true,
    applicants: 0,
    views: 0,
  };
}

function mapJobDetail(job) {
  return mapJobList(job);
}

export const listPublicJobs = asyncHandler(async (req, res) => {
  const { search, location, type, page = 1, pageSize = 10 } = req.query || {};

  const q = { status: "active" };

  if (search) {
    q.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { description: { $regex: String(search), $options: "i" } },
      { companyName: { $regex: String(search), $options: "i" } },
    ];
  }
  if (location) q.location = { $regex: String(location), $options: "i" };
  if (type) q.type = String(type);

  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(pageSize) || 10));

  const [items, total] = await Promise.all([
    Job.find(q).sort({ createdAt: -1 }).skip((p - 1) * ps).limit(ps),
    Job.countDocuments(q),
  ]);

  return ok(
    res,
    {
      items: items.map(mapJobList),
      total,
      page: p,
      pageSize: ps,
    },
    "Jobs"
  );
});

export const getPublicJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  return ok(res, { job: mapJobDetail(job) }, "Job");
});
