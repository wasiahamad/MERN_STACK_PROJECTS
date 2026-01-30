import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { RecruiterProfile } from "../models/RecruiterProfile.js";

function recruiterStatusFromApplication(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "new";
  if (s === "reviewing") return "reviewed";
  if (s === "withdrawn") return "rejected";
  return s;
}

export const getRecruiterStats = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;

  const [jobsActive, jobsTotal, appsTotal, appsGrouped, profile] = await Promise.all([
    Job.countDocuments({ recruiterId, status: "active" }),
    Job.countDocuments({ recruiterId }),
    Application.countDocuments({ recruiterId }),
    Application.aggregate([
      { $match: { recruiterId: new mongoose.Types.ObjectId(String(recruiterId)) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    RecruiterProfile.findOne({ userId: recruiterId }),
  ]);

  const pipeline = {
    all: appsTotal,
    new: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    offered: 0,
    rejected: 0,
  };

  for (const row of appsGrouped) {
    const key = recruiterStatusFromApplication(row?._id);
    if (key in pipeline) pipeline[key] += Number(row.count || 0);
  }

  return ok(
    res,
    {
      jobs: {
        active: jobsActive,
        total: jobsTotal,
      },
      applicants: {
        total: appsTotal,
      },
      pipeline,
      profile: {
        isComplete: Boolean(profile?.isComplete),
      },
    },
    "Recruiter stats"
  );
});
