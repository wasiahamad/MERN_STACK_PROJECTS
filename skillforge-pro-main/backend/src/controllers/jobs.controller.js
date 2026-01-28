import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/Job.js";

function asStringArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  // Support comma-separated values
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

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
  const { search, location, type, page = 1, pageSize = 10, limit, sort, skills } = req.query || {};

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

  const skillsList = asStringArray(skills);
  if (skillsList.length) {
    q.skills = { $all: skillsList };
  }

  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(limit ?? pageSize) || 10));

  const sortBy = (() => {
    const s = String(sort || "").toLowerCase();
    if (s === "oldest") return { createdAt: 1 };
    return { createdAt: -1 };
  })();

  const [items, total] = await Promise.all([
    Job.find(q).sort(sortBy).skip((p - 1) * ps).limit(ps),
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

export const listRecommendedJobs = asyncHandler(async (req, res) => {
  const { limit } = req.query || {};
  const max = Math.min(20, Math.max(1, Number(limit) || 3));

  // Simple MVP recommendation:
  // - Prefer jobs where candidate AI score meets threshold
  // - Prefer jobs that overlap skills
  const user = req.user;
  const candidateSkills = Array.isArray(user?.skills) ? user.skills.map((s) => String(s.name)) : [];
  const aiScore = typeof user?.aiScore === "number" ? user.aiScore : null;

  const jobs = await Job.find({ status: "active" }).sort({ createdAt: -1 }).limit(100);

  const scored = jobs
    .map((job) => {
      const overlap = candidateSkills.length
        ? job.skills.filter((s) => candidateSkills.includes(String(s))).length
        : 0;
      const aiOk = aiScore == null ? 0 : aiScore >= (job.minAiScore ?? 0) ? 1 : -1;
      return { job, score: overlap * 10 + aiOk * 5 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => mapJobList(x.job));

  return ok(res, { items: scored }, "Recommended jobs");
});
