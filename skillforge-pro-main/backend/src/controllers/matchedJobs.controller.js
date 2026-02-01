import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { Job } from "../models/Job.js";
import { getVerifiedSkillKeysForCandidate, computeSkillMatch } from "../utils/skillMatching.js";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function asNumber(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatSalary(job) {
  const min = asNumber(job.salaryMin);
  const max = asNumber(job.salaryMax);
  if (min !== null && max !== null) {
    return `₹${inr.format(min)} - ₹${inr.format(max)}`;
  }
  return "";
}

function mapJobList(job) {
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
    experience: job.experience || "",
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    skills: Array.isArray(job.skills) ? job.skills : [],
    minAiScore: job.minAiScore ?? 0,
    requiredCertificates: job.requiredCertificates || [],
    verified: true,
    applicants: 0,
    views: typeof job.views === "number" ? job.views : 0,
  };
}

export const listMatchedJobs = asyncHandler(async (req, res) => {
  const { minScore = 60, page = 1, pageSize = 12, limit } = req.query || {};

  const threshold = Math.max(0, Math.min(100, Number(minScore) || 60));
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(50, Math.max(1, Number(limit ?? pageSize) || 12));

  const verifiedSkillKeys = await getVerifiedSkillKeysForCandidate({
    userId: req.user._id,
    legacySkills: req.user.skills,
  });

  // If candidate has no verified skills, they can't match anything.
  if (verifiedSkillKeys.size === 0) {
    return ok(res, { items: [], total: 0, page: p, pageSize: ps, minScore: threshold }, "Matched jobs");
  }

  // For MVP: fetch a bounded set, compute match in memory.
  const jobs = await Job.find({ status: "active" }).sort({ createdAt: -1 }).limit(500);

  const scored = jobs
    .map((job) => {
      const match = computeSkillMatch({ requiredSkills: job.skills, verifiedSkillKeys });
      return {
        job: mapJobList(job),
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      };
    })
    .filter((x) => x.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore);

  const total = scored.length;
  const start = (p - 1) * ps;
  const end = start + ps;

  return ok(
    res,
    {
      items: scored.slice(start, end).map((x) => ({ ...x.job, matchScore: x.matchScore, matchedSkills: x.matchedSkills, missingSkills: x.missingSkills })),
      total,
      page: p,
      pageSize: ps,
      minScore: threshold,
    },
    "Matched jobs"
  );
});
