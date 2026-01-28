import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "interview", "offered", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },

    coverLetter: { type: String, default: "" },

    // demo fields (frontend expects these)
    matchScore: { type: Number, default: 0 },
    aiVerified: { type: Boolean, default: false },
    nftVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model("Application", ApplicationSchema);
