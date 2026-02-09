import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { Notification } from "../models/Notification.js";
import { JobAssessmentAttempt } from "../models/JobAssessmentAttempt.js";
import { computeSkillMatch, getVerifiedSkillKeysForCandidate } from "../utils/skillMatching.js";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function asNumber(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapApplication(app, job) {
  return {
    id: String(app._id),
    jobId: String(app.jobId),
    userId: String(app.candidateId),
    status: app.status,
    appliedDate: app.createdAt,
    matchScore: app.matchScore,
    aiVerified: app.aiVerified,
    nftVerified: app.nftVerified,
    job: job
      ? {
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
          views: 0,
        }
      : undefined,
  };
}

export const applyToJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coverLetter } = req.body || {};

  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  if (job.assessment?.enabled) {
    const required = typeof job.assessment.passPercent === "number" ? job.assessment.passPercent : 60;
    const passed = await JobAssessmentAttempt.findOne({
      jobId: job._id,
      candidateId: req.user._id,
      status: "submitted",
      passed: true,
    })
      .sort({ attemptNumber: -1, submittedAt: -1, createdAt: -1 })
      .limit(1);

    if (!passed) {
      throw new ApiError(
        400,
        "ASSESSMENT_NOT_PASSED",
        `You must pass the job screening assessment (${required}%+) before applying`
      );
    }
  }

  const verifiedSkillKeys = await getVerifiedSkillKeysForCandidate({
    userId: req.user._id,
    legacySkills: req.user.skills,
  });

  if (verifiedSkillKeys.size === 0) {
    throw new ApiError(400, "SKILLS_NOT_VERIFIED", "Please verify your skills before applying");
  }

  const { matchScore } = computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys });
  if (matchScore < 60) {
    throw new ApiError(400, "LOW_MATCH", "Your verified skills match is below 60% for this job");
  }

  try {
    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      recruiterId: job.recruiterId,
      coverLetter: typeof coverLetter === "string" ? coverLetter : "",
      matchScore,
      aiVerified: false,
      nftVerified: false,
    });

    // Notify recruiter about new application
    await Notification.create({
      userId: job.recruiterId,
      type: "application",
      title: "New application received",
      message: `Job: ${job.title}\nCandidate: ${req.user?.name || req.user?.email || ""}\nMatch: ${matchScore}%`,
      time: new Date().toISOString(),
      read: false,
    });

    return created(
      res,
      {
        applicationId: String(application._id),
        status: application.status,
      },
      "Application submitted"
    );
  } catch (e) {
    if (e?.code === 11000) {
      throw new ApiError(409, "ALREADY_APPLIED", "You already applied to this job");
    }
    throw e;
  }
});

export const listMyApplications = asyncHandler(async (req, res) => {
  const { status, search, page = 1, pageSize = 10, limit } = req.query || {};

  const q = { candidateId: req.user._id };
  if (status) q.status = String(status);

  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(limit ?? pageSize) || 10));

  const apps = await Application.find(q).sort({ createdAt: -1 }).skip((p - 1) * ps).limit(ps);
  const total = await Application.countDocuments(q);

  const jobIds = apps.map((a) => a.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } });
  const jobMap = new Map(jobs.map((j) => [String(j._id), j]));

  const verifiedSkillKeys = await getVerifiedSkillKeysForCandidate({
    userId: req.user._id,
    legacySkills: req.user.skills,
  });

  const resumeSkillKeys = Array.isArray(req.user.resumeParsed?.skillKeys) ? req.user.resumeParsed.skillKeys : [];
  const combinedSkillKeys = new Set([...verifiedSkillKeys]);
  for (const k of resumeSkillKeys) combinedSkillKeys.add(String(k));

  return ok(
    res,
    {
      items: apps.map((a) => {
        const job = jobMap.get(String(a.jobId));
        if (!job) return mapApplication(a, job);

        const { matchScore } = computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys: combinedSkillKeys });
        return {
          ...mapApplication(a, job),
          matchScore,
        };
      }),
      total,
      page: p,
      pageSize: ps,
    },
    "Applications"
  );
});

export const listApplicantsForJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (String(job.recruiterId) !== String(req.user._id)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }

  const apps = await Application.find({ jobId: job._id }).sort({ createdAt: -1 });
  return ok(
    res,
    {
      items: apps.map((a) => ({
        id: String(a._id),
        candidateId: String(a.candidateId),
        status: a.status,
        appliedDate: a.createdAt,
        matchScore: a.matchScore,
        aiVerified: a.aiVerified,
        nftVerified: a.nftVerified,
      })),
      total: apps.length,
    },
    "Applicants"
  );
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body || {};

  const normalized = (() => {
    const s = String(status || "").toLowerCase();
    if (s === "new") return "pending";
    if (s === "reviewed") return "reviewing";
    return s;
  })();

  const allowed = ["pending", "reviewing", "shortlisted", "interview", "offered", "rejected", "withdrawn"];
  if (!allowed.includes(normalized)) {
    throw new ApiError(400, "VALIDATION", "Invalid status");
  }

  const app = await Application.findById(applicationId);
  if (!app) throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application not found");

  // Recruiter can update only their applications
  if (String(app.recruiterId) !== String(req.user._id)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }

  app.status = normalized;
  await app.save();

  // Notify candidate about status update
  const job = await Job.findById(app.jobId).select({ title: 1 });
  await Notification.create({
    userId: app.candidateId,
    type: "status",
    title: "Application status updated",
    message: `${job?.title ? `Job: ${job.title}\n` : ""}New status: ${app.status}`,
    time: new Date().toISOString(),
    read: false,
  });

  return ok(res, { id: String(app._id), status: app.status }, "Application updated");
});
