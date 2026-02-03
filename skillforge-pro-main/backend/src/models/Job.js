import mongoose from "mongoose";

const JobAssessmentQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length === 4 },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"] },
    hash: { type: String, required: true },
  },
  { _id: false }
);

const JobAssessmentSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    passPercent: { type: Number, default: 60, min: 0, max: 100 },
    marksPerQuestion: { type: Number, default: 1, min: 0.25, max: 100 },
    questions: { type: [JobAssessmentQuestionSchema], default: [] },
    updatedAt: { type: Date },
  },
  { _id: false }
);

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

    assessment: { type: JobAssessmentSchema, default: () => ({ enabled: false, passPercent: 60, marksPerQuestion: 1, questions: [] }) },

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
