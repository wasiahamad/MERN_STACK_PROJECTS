import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";

function asNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const listRecruiterActivity = asyncHandler(async (req, res) => {
  const { limit } = req.query || {};
  const max = Math.min(50, Math.max(1, asNumber(limit, 10)));

  const [jobs, apps] = await Promise.all([
    Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).limit(max),
    Application.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).limit(max),
  ]);

  const activity = [];

  for (const j of jobs) {
    activity.push({
      type: "job",
      id: String(j._id),
      time: j.createdAt,
      title: "Job posted",
      message: `You posted: ${j.title}`,
    });
  }

  for (const a of apps) {
    activity.push({
      type: "application",
      id: String(a._id),
      time: a.createdAt,
      title: "New application",
      message: `Application received for job ${String(a.jobId)}`,
      jobId: String(a.jobId),
      candidateId: String(a.candidateId),
      status: a.status,
    });
  }

  activity.sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime());

  return ok(res, { items: activity.slice(0, max) }, "Recruiter activity");
});
