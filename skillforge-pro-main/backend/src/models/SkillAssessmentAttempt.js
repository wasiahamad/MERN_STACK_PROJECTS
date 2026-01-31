import mongoose from "mongoose";

const SkillAssessmentQuestionSchema = new mongoose.Schema(
  {
    // Stable ID used by client when submitting answers.
    questionId: { type: String, required: true },

    text: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length === 4 },

    // Stored only on server (never returned to client).
    correctIndex: { type: Number, required: true, min: 0, max: 3 },

    difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"] },

    // Hash helps prevent repeats and allows quick uniqueness checks.
    hash: { type: String, required: true },
  },
  { _id: false }
);

const SkillAssessmentAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const SkillAssessmentAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    skillName: { type: String, required: true, trim: true, index: true },

    attemptNumber: { type: Number, required: true },

    // Exam lifecycle
    status: { type: String, enum: ["in_progress", "submitted", "failed"], default: "in_progress", index: true },
    startedAt: { type: Date, required: true, default: () => new Date() },
    submittedAt: { type: Date },

    // Anti-cheat signal from frontend (we still compute result server-side).
    violationCount: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false },

    // Questions are generated at the moment the attempt starts.
    questions: { type: [SkillAssessmentQuestionSchema], default: [] },

    // Answers only exist after submission.
    answers: { type: [SkillAssessmentAnswerSchema], default: [] },

    // Result fields
    correctCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ["verified", "partially_verified", "not_verified"],
      default: "not_verified",
      index: true,
    },
  },
  { timestamps: true }
);

SkillAssessmentAttemptSchema.index({ userId: 1, skillName: 1, attemptNumber: -1 });

export const SkillAssessmentAttempt = mongoose.model("SkillAssessmentAttempt", SkillAssessmentAttemptSchema);
