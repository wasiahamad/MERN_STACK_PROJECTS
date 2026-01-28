import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";

function toYyyyMmDd(date) {
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function recruiterStatusFromApplication(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "new";
  if (s === "reviewing") return "reviewed";
  if (s === "withdrawn") return "rejected";
  return s;
}

function applicationStatusFromRecruiterStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "new") return "pending";
  if (s === "reviewed") return "reviewing";
  return s;
}

function mapCandidateFrom(user, application, job) {
  const skills = Array.isArray(user.skills) ? user.skills.map((x) => String(x.name)) : [];
  const minted = Array.isArray(user.certificates)
    ? user.certificates.filter((c) => c && c.nftMinted).map((c) => String(c.name))
    : [];

  return {
    applicationId: String(application._id),
    jobId: String(application.jobId),
    jobTitle: job?.title || "",

    id: String(user._id),
    name: user.name || user.email,
    avatar: user.avatar || "",
    title: user.headline || "",
    location: user.location || "",
    skills,
    aiScore: typeof user.aiScore === "number" ? user.aiScore : 0,
    matchScore: typeof application.matchScore === "number" ? application.matchScore : 0,
    experience: Array.isArray(user.experience) && user.experience.length ? `${user.experience.length} roles` : "",
    appliedDate: toYyyyMmDd(application.createdAt),
    status: recruiterStatusFromApplication(application.status),
    nftCertificates: minted,
    reputation: typeof user.reputation === "number" ? user.reputation : 0,
  };
}

export const listRecruiterCandidates = asyncHandler(async (req, res) => {
  const { search, status, jobId, sort, page = 1, pageSize = 10, limit } = req.query || {};

  const q = { recruiterId: req.user._id };
  if (jobId) q.jobId = String(jobId);

  if (status && String(status) !== "all") {
    const internal = applicationStatusFromRecruiterStatus(status);
    // recruiter UI doesn't include withdrawn; still allow filtering if asked
    q.status = String(internal);
  }

  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(limit ?? pageSize) || 10));

  const apps = await Application.find(q)
    .sort({ createdAt: -1 })
    .skip((p - 1) * ps)
    .limit(ps);
  const total = await Application.countDocuments(q);

  const candidateIds = apps.map((a) => a.candidateId);
  const jobsIds = apps.map((a) => a.jobId);

  const [candidates, jobs] = await Promise.all([
    User.find({ _id: { $in: candidateIds } }),
    Job.find({ _id: { $in: jobsIds } }),
  ]);

  const userMap = new Map(candidates.map((u) => [String(u._id), u]));
  const jobMap = new Map(jobs.map((j) => [String(j._id), j]));

  let items = apps
    .map((a) => {
      const user = userMap.get(String(a.candidateId));
      if (!user) return null;
      return mapCandidateFrom(user, a, jobMap.get(String(a.jobId)));
    })
    .filter(Boolean);

  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(s) || c.title.toLowerCase().includes(s));
  }

  if (sort && String(sort).toLowerCase() === "matchscore") {
    items = items.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return ok(res, { items, total, page: p, pageSize: ps }, "Recruiter candidates");
});

export const updateRecruiterCandidateStatus = asyncHandler(async (req, res) => {
  // NOTE: :id is treated as applicationId (preferred because status is per application)
  const { id } = req.params;
  const { status } = req.body || {};

  const normalized = applicationStatusFromRecruiterStatus(status);
  const allowed = ["pending", "reviewing", "shortlisted", "interview", "offered", "rejected", "withdrawn"];
  if (!allowed.includes(String(normalized))) {
    throw new ApiError(400, "VALIDATION", "Invalid status");
  }

  const app = await Application.findById(id);
  if (!app) throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application not found");

  if (String(app.recruiterId) !== String(req.user._id)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }

  app.status = String(normalized);
  await app.save();

  return ok(
    res,
    {
      applicationId: String(app._id),
      status: recruiterStatusFromApplication(app.status),
    },
    "Candidate status updated"
  );
});
