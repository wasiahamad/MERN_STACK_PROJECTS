import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },

    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    experience: { type: String, default: "" },

    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], required: true, default: [] },

    minAiScore: { type: Number, default: null },
    requiredCertificates: { type: [String], default: [] },

    status: { type: String, enum: ["active", "paused", "closed"], default: "active" },

    views: { type: Number, default: 0 },

    // denormalized company snapshot for simple listing
    companyName: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", JobSchema);
