import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";
import { Notification } from "../models/Notification.js";
import { SkillAssessmentAttempt } from "../models/SkillAssessmentAttempt.js";
import { computeSkillMatch, normalizeSkillKey } from "../utils/skillMatching.js";
import path from "path";

function safeDownloadName(name, fallbackExt = "") {
  const base = String(name || "").trim() || `file${fallbackExt}`;
  const cleaned = base
    .replace(/[\\/]/g, "-")
    .replace(/[\r\n\t]/g, " ")
    .replace(/[\"\u0000]/g, "")
    .slice(0, 160)
    .trim();
  if (!fallbackExt) return cleaned || "file";
  return cleaned.toLowerCase().endsWith(fallbackExt.toLowerCase()) ? cleaned : `${cleaned}${fallbackExt}`;
}

function filePathFromUploadsUrl(url) {
  const u = String(url || "");
  if (!u.startsWith("/uploads/")) return "";
  const rel = u.slice("/uploads/".length).replace(/^[/\\]+/, "");
  if (!rel || rel.includes("..")) return "";
  return path.resolve("uploads", rel);
}

async function assertRecruiterCanAccessCandidate(req, candidateId) {
  const app = await Application.findOne({ recruiterId: req.user._id, candidateId: String(candidateId) }).select({ _id: 1 });
  if (!app) throw new ApiError(403, "FORBIDDEN", "Not allowed to access this candidate's files");
}

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
  const skills = Array.isArray(user.skills)
    ? user.skills
        .map((x) => {
          if (!x) return "";
          if (typeof x === "string") return x;
          return String(x.name || "");
        })
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const minted = Array.isArray(user.certificates)
    ? user.certificates.filter((c) => c && c.nftMinted).map((c) => String(c.name))
    : [];

  const certificates = Array.isArray(user.certificates)
    ? user.certificates
        .filter(Boolean)
        .map((c) => ({
          id: String(c._id),
          name: c.name,
          issuer: c.issuer,
          date: c.date,
          nftMinted: !!c.nftMinted,
          tokenId: c.tokenId || undefined,
          image: c.image || "",
          fileName: c.fileName || undefined,
          fileMime: c.fileMime || undefined,
          verified: !!c.verified,
        }))
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
    email: user.email,
    phone: user.phone || "",
    about: user.about || "",
    socials: user.socials || undefined,
    resumeUrl: user.resumeUrl || undefined,
    resumeFileName: user.resumeFileName || undefined,
    resumeMime: user.resumeMime || undefined,
    aiScore: typeof user.aiScore === "number" ? user.aiScore : 0,
    matchScore: typeof application.matchScore === "number" ? application.matchScore : 0,
    profileMatchScore: 0,
    matchedSkills: [],
    missingSkills: [],
    experience: Array.isArray(user.experience) && user.experience.length ? `${user.experience.length} roles` : "",
    appliedDate: toYyyyMmDd(application.createdAt),
    status: recruiterStatusFromApplication(application.status),
    nftCertificates: minted,
    certificates,
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

  // Precompute verified skill keys per candidate to enable match breakdown.
  const verifiedKeysByUserId = new Map();
  const claimedKeysByUserId = new Map();

  for (const u of candidates) {
    const set = new Set();
    const claimed = new Set();

    // Legacy verified skills
    if (Array.isArray(u.skills)) {
      for (const s of u.skills) {
        if (!s) continue;

        const skillName = typeof s === "string" ? s : s.name;
        const ck = normalizeSkillKey(skillName);
        if (ck) claimed.add(ck);

        if (typeof s === "object" && s.verified) {
          const k = normalizeSkillKey(s.name);
          if (k) set.add(k);
        }
      }
    }

    verifiedKeysByUserId.set(String(u._id), set);
    claimedKeysByUserId.set(String(u._id), claimed);
  }

  // Assessment-verified skills (batched)
  if (candidateIds.length) {
    const rows = await SkillAssessmentAttempt.aggregate([
      {
        $match: {
          userId: { $in: candidateIds },
          status: "submitted",
          verificationStatus: "verified",
        },
      },
      { $group: { _id: { userId: "$userId", skillName: "$skillName" } } },
    ]);

    for (const r of rows) {
      const uid = String(r?._id?.userId || "");
      const skillName = r?._id?.skillName;
      if (!uid || !skillName) continue;
      const set = verifiedKeysByUserId.get(uid) || new Set();
      const k = normalizeSkillKey(skillName);
      if (k) set.add(k);
      verifiedKeysByUserId.set(uid, set);
    }
  }

  let items = apps
    .map((a) => {
      const user = userMap.get(String(a.candidateId));
      if (!user) return null;

      const job = jobMap.get(String(a.jobId));
      const mapped = mapCandidateFrom(user, a, job);

      // Compute match (using VERIFIED skills) when missing/older applications have no matchScore.
      const verifiedKeys = verifiedKeysByUserId.get(String(user._id)) || new Set();
      const claimedKeys = claimedKeysByUserId.get(String(user._id)) || new Set();
      const computed = job
        ? computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys: verifiedKeys })
        : { matchScore: 0, matchedSkills: [], missingSkills: [] };

      const profileComputed = job
        ? computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys: claimedKeys })
        : { matchScore: 0 };

      const hasStored = typeof a.matchScore === "number" && Number.isFinite(a.matchScore);
      mapped.matchScore = hasStored ? a.matchScore : computed.matchScore;
      mapped.profileMatchScore = profileComputed.matchScore;
      mapped.matchedSkills = computed.matchedSkills;
      mapped.missingSkills = computed.missingSkills;

      return mapped;
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

export const sendRecruiterMessageToCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params; // applicationId
  const message = String(req.body?.message || "").trim();
  if (!message || message.length < 2 || message.length > 2000) {
    throw new ApiError(400, "VALIDATION", "message must be 2..2000 chars");
  }

  const app = await Application.findById(id);
  if (!app) throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application not found");
  if (String(app.recruiterId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not allowed");

  const job = await Job.findById(app.jobId).select({ title: 1 });
  await Notification.create({
    userId: app.candidateId,
    type: "message",
    title: "Recruiter message",
    message: `${job?.title ? `Job: ${job.title}\n` : ""}${message}`,
    time: new Date().toISOString(),
    read: false,
  });

  return ok(res, { ok: true }, "Message sent");
});

export const scheduleRecruiterInterview = asyncHandler(async (req, res) => {
  const { id } = req.params; // applicationId
  const whenRaw = String(req.body?.scheduledFor || "").trim();
  const note = String(req.body?.note || "").trim();
  const when = whenRaw ? new Date(whenRaw) : null;
  if (!when || Number.isNaN(when.getTime())) {
    throw new ApiError(400, "VALIDATION", "scheduledFor must be a valid date/time");
  }

  const app = await Application.findById(id);
  if (!app) throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application not found");
  if (String(app.recruiterId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not allowed");

  // Optional: move pipeline to interview
  app.status = "interview";
  await app.save();

  const job = await Job.findById(app.jobId).select({ title: 1 });
  await Notification.create({
    userId: app.candidateId,
    type: "interview",
    title: "Interview scheduled",
    message: `${job?.title ? `Job: ${job.title}\n` : ""}Scheduled for: ${when.toISOString()}${note ? `\n\nNote: ${note}` : ""}`,
    time: when.toISOString(),
    read: false,
  });

  return ok(res, { ok: true, status: recruiterStatusFromApplication(app.status) }, "Interview scheduled");
});

export const downloadRecruiterCandidateResume = asyncHandler(async (req, res, next) => {
  const { candidateId } = req.params;
  await assertRecruiterCanAccessCandidate(req, candidateId);

  const u = await User.findById(candidateId).select({ resumeUrl: 1, resumeFileName: 1, resumeMime: 1, name: 1, email: 1 });
  if (!u) throw new ApiError(404, "CANDIDATE_NOT_FOUND", "Candidate not found");
  if (!u.resumeUrl) throw new ApiError(404, "FILE_NOT_FOUND", "No resume uploaded");

  const absPath = filePathFromUploadsUrl(u.resumeUrl);
  if (!absPath) throw new ApiError(400, "INVALID_FILE_URL", "Invalid resume file URL");

  const ext = String(path.extname(absPath) || "").toLowerCase();
  const inferredPdf = ext === ".pdf" || String(u.resumeFileName || "").toLowerCase().endsWith(".pdf");
  const mime = (() => {
    const m = String(u.resumeMime || "").trim();
    if (m) return m;
    if (inferredPdf) return "application/pdf";
    return "application/octet-stream";
  })();
  const fallbackExt = mime === "application/pdf" ? ".pdf" : ext || "";
  const baseName = u.resumeFileName || `${u.name || u.email || "candidate"}-resume`;
  const downloadName = safeDownloadName(baseName, fallbackExt);

  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);

  return res.sendFile(absPath, (err) => {
    if (err) return next(new ApiError(404, "FILE_NOT_FOUND", "File not found on server"));
  });
});

export const downloadRecruiterCandidateCertificateFile = asyncHandler(async (req, res, next) => {
  const { candidateId, certId } = req.params;
  await assertRecruiterCanAccessCandidate(req, candidateId);

  const u = await User.findById(candidateId).select({ certificates: 1, name: 1, email: 1 });
  if (!u) throw new ApiError(404, "CANDIDATE_NOT_FOUND", "Candidate not found");

  const cert = u.certificates?.id(certId);
  if (!cert) throw new ApiError(404, "CERT_NOT_FOUND", "Certificate not found");
  if (!cert.image) throw new ApiError(404, "FILE_NOT_FOUND", "No uploaded file for this certificate");

  const absPath = filePathFromUploadsUrl(cert.image);
  if (!absPath) throw new ApiError(400, "INVALID_FILE_URL", "Invalid certificate file URL");

  const ext = String(path.extname(absPath) || "").toLowerCase();
  const inferredPdf =
    ext === ".pdf" ||
    String(cert.fileName || "").toLowerCase().endsWith(".pdf") ||
    String(cert.image || "").toLowerCase().endsWith(".pdf");
  const mime = (() => {
    const m = String(cert.fileMime || "").trim();
    if (m) return m;
    if (inferredPdf) return "application/pdf";
    return "application/octet-stream";
  })();
  const fallbackExt = mime === "application/pdf" ? ".pdf" : ext || "";
  const baseName = cert.fileName || cert.name || `${u.name || u.email || "candidate"}-certificate`;
  const downloadName = safeDownloadName(baseName, fallbackExt);

  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);

  return res.sendFile(absPath, (err) => {
    if (err) return next(new ApiError(404, "FILE_NOT_FOUND", "File not found on server"));
  });
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

  const job = await Job.findById(app.jobId).select({ title: 1 });
  await Notification.create({
    userId: app.candidateId,
    type: "status",
    title: "Application update",
    message: `${job?.title ? `Job: ${job.title}\n` : ""}Status: ${recruiterStatusFromApplication(app.status)}`,
    time: new Date().toISOString(),
    read: false,
  });

  return ok(
    res,
    {
      applicationId: String(app._id),
      status: recruiterStatusFromApplication(app.status),
    },
    "Candidate status updated"
  );
});
