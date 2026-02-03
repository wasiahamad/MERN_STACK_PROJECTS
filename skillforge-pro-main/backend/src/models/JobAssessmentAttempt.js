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

const JobAssessmentAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const JobAssessmentAttemptSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    attemptNumber: { type: Number, required: true },

    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress", index: true },
    startedAt: { type: Date, required: true, default: () => new Date() },
    submittedAt: { type: Date },

    // Snapshot of the questions at the moment the attempt starts.
    questions: { type: [JobAssessmentQuestionSchema], default: [] },
    answers: { type: [JobAssessmentAnswerSchema], default: [] },

    // Marking scheme snapshot
    passPercent: { type: Number, required: true, min: 0, max: 100 },
    marksPerQuestion: { type: Number, required: true, min: 0.25, max: 100 },
    totalMarks: { type: Number, default: 0 },

    // Result
    correctCount: { type: Number, default: 0 },
    scoreMarks: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    passed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

JobAssessmentAttemptSchema.index({ jobId: 1, candidateId: 1, attemptNumber: -1 });
JobAssessmentAttemptSchema.index({ jobId: 1, candidateId: 1, passed: 1 });

export const JobAssessmentAttempt = mongoose.model("JobAssessmentAttempt", JobAssessmentAttemptSchema);
