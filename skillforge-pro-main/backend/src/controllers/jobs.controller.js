import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { Application } from "../models/Application.js";
import { JobAssessmentAttempt } from "../models/JobAssessmentAttempt.js";
import { computeSkillMatch, getVerifiedSkillKeysForCandidate } from "../utils/skillMatching.js";

function asStringArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  // Support comma-separated values
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNumber(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function formatSalary(job) {
  const min = asNumber(job.salaryMin);
  const max = asNumber(job.salaryMax);
  if (min !== null && max !== null) return `₹${inr.format(min)} - ₹${inr.format(max)}`;
  return "";
}

function mapJobList(job) {
  const assessment = job.assessment || {};
  const assessmentQuestions = Array.isArray(assessment.questions) ? assessment.questions : [];
  return {
    id: String(job._id),
    title: job.title,
    company: job.companyName || "",
    logo: job.companyLogo || "",
    companyWebsite: job.companyWebsite || "",
    industry: job.industry || "",
    companySize: job.companySize || "",
    location: job.location,
    type: job.type,
    salary: formatSalary(job),
    posted: job.createdAt,
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    skills: job.skills,
    minAiScore: job.minAiScore ?? 0,
    requiredCertificates: job.requiredCertificates || [],
    verified: true,
    applicants: 0,
    views: typeof job.views === "number" ? job.views : 0,
    assessment: {
      enabled: Boolean(assessment.enabled),
      passPercent: typeof assessment.passPercent === "number" ? assessment.passPercent : 60,
      marksPerQuestion: typeof assessment.marksPerQuestion === "number" ? assessment.marksPerQuestion : 1,
      questionsCount: assessmentQuestions.length,
      updatedAt: assessment.updatedAt || null,
    },
  };
}

function mapJobDetail(job, extra) {
  return {
    ...mapJobList(job),
    applicants: extra?.applicants ?? 0,
    views: extra?.views ?? (typeof job.views === "number" ? job.views : 0),
    openPositions: extra?.openPositions ?? undefined,
  };
}

export const listPublicJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    type,
    experience,
    salaryMin,
    salaryMax,
    page = 1,
    pageSize = 10,
    limit,
    sort,
    skills,
  } = req.query || {};

  const q = { status: "active" };

  // If a recruiter is authenticated (optionalAuth), limit them to only their own jobs.
  if (req.user?.role === "recruiter") {
    q.recruiterId = req.user._id;
  }

  if (search) {
    q.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { description: { $regex: String(search), $options: "i" } },
      { companyName: { $regex: String(search), $options: "i" } },
    ];
  }
  if (location) q.location = { $regex: String(location), $options: "i" };
  if (type) q.type = String(type);
  if (experience) q.experience = { $regex: String(experience), $options: "i" };

  const sMin = asNumber(salaryMin);
  const sMax = asNumber(salaryMax);
  // Filter by overlap with requested salary band
  if (sMin !== null) q.salaryMax = { ...(q.salaryMax || {}), $gte: sMin };
  if (sMax !== null) q.salaryMin = { ...(q.salaryMin || {}), $lte: sMax };

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

  // Recruiters should not be able to view other recruiters' jobs.
  if (req.user?.role === "recruiter" && String(job.recruiterId) !== String(req.user._id)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }

  // Increment views for anonymous/candidates only.
  if (!req.user || req.user.role === "candidate") {
    job.views = (typeof job.views === "number" ? job.views : 0) + 1;
    await job.save();
  }

  const applicants = await Application.countDocuments({ jobId: job._id });

  const openPositions = job.companyName
    ? await Job.countDocuments({ status: "active", companyName: job.companyName })
    : null;

  const mapped = mapJobDetail(job, { applicants, views: job.views, openPositions: openPositions ?? undefined });

  // If a candidate is authenticated, attach matchScore based on VERIFIED skills.
  if (req.user?.role === "candidate") {
    const verifiedSkillKeys = await getVerifiedSkillKeysForCandidate({
      userId: req.user._id,
      legacySkills: req.user.skills,
    });

    const match = computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys });
    mapped.matchScore = match.matchScore;

    const myLatest = await JobAssessmentAttempt.findOne({ jobId: job._id, candidateId: req.user._id })
      .sort({ attemptNumber: -1, createdAt: -1 })
      .limit(1);

    mapped.myAssessment = myLatest
      ? {
          attemptId: String(myLatest._id),
          status: myLatest.status,
          attemptNumber: myLatest.attemptNumber,
          percent: myLatest.percent,
          passed: Boolean(myLatest.passed),
          submittedAt: myLatest.submittedAt || null,
        }
      : null;
  }

  return ok(res, { job: mapped }, "Job");
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

export const toggleSaveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

  const key = String(job._id);
  const existing = Array.isArray(user.savedJobs) ? user.savedJobs.map((x) => String(x)) : [];
  const isSaved = existing.includes(key);

  if (isSaved) {
    user.savedJobs = (user.savedJobs || []).filter((x) => String(x) !== key);
  } else {
    user.savedJobs = [...(user.savedJobs || []), job._id];
  }

  await user.save();
  return ok(res, { saved: !isSaved, jobId: key }, !isSaved ? "Saved" : "Unsaved");
});
