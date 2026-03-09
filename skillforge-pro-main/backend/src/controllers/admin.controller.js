import { User } from "../models/User.js";
import { RecruiterProfile } from "../models/RecruiterProfile.js";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";

/**
 * Get all recruiters with their profiles and statistics
 * GET /api/admin/recruiters
 */
export async function getAllRecruiters(req, res) {
  try {
    // Find all users with role "recruiter"
    const recruiters = await User.find({ role: "recruiter" })
      .select("_id email name phone createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Get profiles for all recruiters
    const recruiterIds = recruiters.map((r) => r._id);
    const profiles = await RecruiterProfile.find({ userId: { $in: recruiterIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    // Get job statistics for each recruiter
    const jobStats = await Job.aggregate([
      { $match: { createdBy: { $in: recruiterIds } } },
      {
        $group: {
          _id: "$createdBy",
          activeJobs: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          totalJobs: { $sum: 1 },
        },
      },
    ]);
    const jobStatsMap = new Map(jobStats.map((s) => [s._id.toString(), s]));

    // Get hire statistics (accepted applications)
    const hireStats = await Application.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      { $match: { status: "accepted" } },
      {
        $group: {
          _id: "$job.createdBy",
          totalHires: { $sum: 1 },
        },
      },
    ]);
    const hireStatsMap = new Map(hireStats.map((h) => [h._id.toString(), h]));

    // Combine all data
    const recruitersData = recruiters.map((recruiter) => {
      const profile = profileMap.get(recruiter._id.toString()) || {};
      const jobs = jobStatsMap.get(recruiter._id.toString()) || { activeJobs: 0, totalJobs: 0 };
      const hires = hireStatsMap.get(recruiter._id.toString()) || { totalHires: 0 };

      return {
        id: recruiter._id,
        email: recruiter.email,
        name: recruiter.name || "N/A",
        phone: recruiter.phone || "N/A",
        companyName: profile.companyName || "N/A",
        industry: profile.industry || "N/A",
        website: profile.website || "N/A",
        location: profile.location || "N/A",
        about: profile.about || "N/A",
        logo: profile.logo || "",
        size: profile.size || "N/A",
        activeJobs: jobs.activeJobs,
        totalJobs: jobs.totalJobs,
        totalHires: hires.totalHires,
        isComplete: profile.isComplete || false,
        joinedAt: recruiter.createdAt,
        status: profile.isComplete ? "active" : "inactive",
      };
    });

    res.json({
      data: {
        recruiters: recruitersData,
        total: recruitersData.length,
      },
      message: "Recruiters fetched successfully",
    });
  } catch (error) {
    console.error("Get all recruiters error:", error);
    res.status(500).json({
      error: "Failed to fetch recruiters",
      message: error.message,
    });
  }
}

/**
 * Get all users (candidates + recruiters)
 * GET /api/admin/users
 */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({ role: { $in: ["candidate", "recruiter"] } })
      .select("_id email name phone role createdAt emailVerified")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      data: {
        users,
        total: users.length,
      },
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message: error.message,
    });
  }
}
