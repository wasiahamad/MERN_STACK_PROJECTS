import crypto from "crypto";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/Job.js";
import { JobAssessmentAttempt } from "../models/JobAssessmentAttempt.js";
import { generateJobAssessment } from "../ai/jobAssessments/generateJobAssessment.js";

function ensureOwner(job, userId) {
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (String(job.recruiterId) !== String(userId)) {
    throw new ApiError(403, "FORBIDDEN", "Not allowed");
  }
}

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "").trim().toLowerCase()).digest("hex");
}

function stableQuestionId(jobId, text) {
  const base = `${String(jobId)}::${String(text || "").trim().toLowerCase()}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}

function normalizeQuestionForStorage(jobId, q) {
  const text = String(q?.text || "").trim();
  const options = Array.isArray(q?.options) ? q.options.map((o) => String(o || "").trim()) : [];
  const difficulty = String(q?.difficulty || "").trim().toLowerCase();
  const correctIndex = Number(q?.correctIndex);

  if (!text) throw new ApiError(400, "VALIDATION", "Question text is required");
  if (options.length !== 4 || options.some((o) => !o)) {
    throw new ApiError(400, "VALIDATION", "Each question must have exactly 4 non-empty options");
  }
  if (!/^(easy|medium|hard)$/.test(difficulty)) {
    throw new ApiError(400, "VALIDATION", "difficulty must be easy|medium|hard");
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    throw new ApiError(400, "VALIDATION", "correctIndex must be 0..3");
  }

  return {
    questionId: String(q?.questionId || stableQuestionId(jobId, text)),
    text,
    options,
    difficulty,
    correctIndex,
    hash: String(q?.hash || hashText(text)),
  };
}

function mapRecruiterAssessment(assessment) {
  const a = assessment || {};
  const questions = Array.isArray(a.questions) ? a.questions : [];
  return {
    enabled: Boolean(a.enabled),
    passPercent: typeof a.passPercent === "number" ? a.passPercent : 60,
    marksPerQuestion: typeof a.marksPerQuestion === "number" ? a.marksPerQuestion : 1,
    questions,
    questionsCount: questions.length,
    updatedAt: a.updatedAt || null,
  };
}

function mapCandidateAssessment(assessment) {
  const a = assessment || {};
  const questions = Array.isArray(a.questions) ? a.questions : [];
  return {
    enabled: Boolean(a.enabled),
    passPercent: typeof a.passPercent === "number" ? a.passPercent : 60,
    marksPerQuestion: typeof a.marksPerQuestion === "number" ? a.marksPerQuestion : 1,
    questions: questions.map((q) => ({
      questionId: q.questionId,
      text: q.text,
      options: q.options,
      difficulty: q.difficulty,
    })),
    questionsCount: questions.length,
    updatedAt: a.updatedAt || null,
  };
}

function mapAttemptSummary(attempt) {
  if (!attempt) return null;
  return {
    id: String(attempt._id),
    jobId: String(attempt.jobId),
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt || null,
    correctCount: attempt.correctCount,
    totalQuestions: Array.isArray(attempt.questions) ? attempt.questions.length : 0,
    marksPerQuestion: attempt.marksPerQuestion,
    totalMarks: attempt.totalMarks,
    scoreMarks: attempt.scoreMarks,
    percent: attempt.percent,
    passPercent: attempt.passPercent,
    passed: Boolean(attempt.passed),
  };
}

export const recruiterGetJobAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);
  return ok(res, { assessment: mapRecruiterAssessment(job.assessment) }, "Job assessment");
});

export const recruiterUpsertJobAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);

  const { enabled, passPercent, marksPerQuestion, questions } = req.body || {};

  if (!job.assessment) job.assessment = { enabled: false, passPercent: 60, marksPerQuestion: 1, questions: [] };

  if (enabled !== undefined) job.assessment.enabled = Boolean(enabled);

  if (passPercent !== undefined) {
    const p = Number(passPercent);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      throw new ApiError(400, "VALIDATION", "passPercent must be between 0 and 100");
    }
    job.assessment.passPercent = p;
  }

  if (marksPerQuestion !== undefined) {
    const m = Number(marksPerQuestion);
    if (!Number.isFinite(m) || m < 0.25 || m > 100) {
      throw new ApiError(400, "VALIDATION", "marksPerQuestion must be between 0.25 and 100");
    }
    job.assessment.marksPerQuestion = m;
  }

  if (questions !== undefined) {
    if (!Array.isArray(questions) || questions.length < 1) {
      throw new ApiError(400, "VALIDATION", "questions must be a non-empty array");
    }
    job.assessment.questions = questions.map((q) => normalizeQuestionForStorage(job._id, q));
  }

  job.assessment.updatedAt = new Date();
  await job.save();

  return ok(res, { assessment: mapRecruiterAssessment(job.assessment) }, "Assessment updated");
});

export const recruiterGenerateJobAssessmentQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replace = true } = req.body || {};

  const job = await Job.findById(id);
  ensureOwner(job, req.user._id);

  const { questions } = await generateJobAssessment({
    jobId: job._id,
    jobTitle: job.title,
    requiredSkills: Array.isArray(job.skills) ? job.skills : [],
    description: job.description,
  });

  if (!job.assessment) job.assessment = { enabled: false, passPercent: 60, marksPerQuestion: 1, questions: [] };
  if (replace || !Array.isArray(job.assessment.questions) || job.assessment.questions.length === 0) {
    job.assessment.questions = questions.map((q) => normalizeQuestionForStorage(job._id, q));
  } else {
    const merged = [...job.assessment.questions, ...questions].slice(0, 10);
    job.assessment.questions = merged.map((q) => normalizeQuestionForStorage(job._id, q));
  }

  job.assessment.updatedAt = new Date();
  await job.save();

  return ok(res, { assessment: mapRecruiterAssessment(job.assessment) }, "Assessment questions generated");
});

export const candidateGetJobAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id).select({ assessment: 1, recruiterId: 1, status: 1 });
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (job.status !== "active") throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  const assessment = mapCandidateAssessment(job.assessment);
  if (!assessment.enabled) {
    return ok(res, { assessment, myAttempt: null }, "Assessment");
  }

  const myLatest = await JobAssessmentAttempt.findOne({ jobId: job._id, candidateId: req.user._id })
    .sort({ attemptNumber: -1, createdAt: -1 })
    .limit(1);

  return ok(res, { assessment, myAttempt: mapAttemptSummary(myLatest) }, "Assessment");
});

export const candidateStartJobAssessmentAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id).select({ assessment: 1, recruiterId: 1, status: 1 });
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (job.status !== "active") throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  if (!job.assessment?.enabled) {
    throw new ApiError(400, "ASSESSMENT_DISABLED", "This job does not require an assessment");
  }
  const questions = Array.isArray(job.assessment.questions) ? job.assessment.questions : [];
  if (questions.length < 1) {
    throw new ApiError(400, "ASSESSMENT_NOT_CONFIGURED", "Assessment is not configured yet");
  }

  const existing = await JobAssessmentAttempt.findOne({
    jobId: job._id,
    candidateId: req.user._id,
    status: "in_progress",
  }).sort({ createdAt: -1 });

  if (existing) {
    return ok(res, { attempt: mapAttemptSummary(existing) }, "Attempt");
  }

  const last = await JobAssessmentAttempt.findOne({ jobId: job._id, candidateId: req.user._id })
    .sort({ attemptNumber: -1, createdAt: -1 })
    .limit(1);

  const attemptNumber = (last?.attemptNumber || 0) + 1;
  const marksPerQuestion = typeof job.assessment.marksPerQuestion === "number" ? job.assessment.marksPerQuestion : 1;
  const totalMarks = Number(marksPerQuestion) * questions.length;
  const passPercent = typeof job.assessment.passPercent === "number" ? job.assessment.passPercent : 60;

  const attempt = await JobAssessmentAttempt.create({
    jobId: job._id,
    recruiterId: job.recruiterId,
    candidateId: req.user._id,
    attemptNumber,
    status: "in_progress",
    startedAt: new Date(),
    questions,
    passPercent,
    marksPerQuestion,
    totalMarks,
  });

  return created(res, { attempt: mapAttemptSummary(attempt) }, "Attempt started");
});

export const candidateSubmitJobAssessmentAttempt = asyncHandler(async (req, res) => {
  const { id, attemptId } = req.params;
  const { answers } = req.body || {};

  if (!Array.isArray(answers)) {
    throw new ApiError(400, "VALIDATION", "answers must be an array");
  }

  const attempt = await JobAssessmentAttempt.findById(attemptId);
  if (!attempt) throw new ApiError(404, "ATTEMPT_NOT_FOUND", "Attempt not found");
  if (String(attempt.jobId) !== String(id)) throw new ApiError(400, "VALIDATION", "Invalid attempt for job");
  if (String(attempt.candidateId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not allowed");
  if (attempt.status === "submitted") {
    return ok(res, { attempt: mapAttemptSummary(attempt) }, "Attempt already submitted");
  }

  const questions = Array.isArray(attempt.questions) ? attempt.questions : [];
  if (!questions.length) throw new ApiError(400, "ASSESSMENT_NOT_CONFIGURED", "No questions in attempt");

  const answerMap = new Map();
  for (const a of answers) {
    const qid = String(a?.questionId || "").trim();
    const selectedIndex = Number(a?.selectedIndex);
    if (!qid) continue;
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
      throw new ApiError(400, "VALIDATION", "selectedIndex must be 0..3");
    }
    answerMap.set(qid, selectedIndex);
  }

  const normalizedAnswers = questions
    .map((q) => {
      const selectedIndex = answerMap.has(String(q.questionId)) ? answerMap.get(String(q.questionId)) : null;
      return selectedIndex === null
        ? null
        : {
            questionId: String(q.questionId),
            selectedIndex,
          };
    })
    .filter(Boolean);

  let correctCount = 0;
  for (const q of questions) {
    const selected = answerMap.get(String(q.questionId));
    if (selected === undefined) continue;
    if (Number(selected) === Number(q.correctIndex)) correctCount += 1;
  }

  const marksPerQuestion = typeof attempt.marksPerQuestion === "number" ? attempt.marksPerQuestion : 1;
  const totalMarks = Number(marksPerQuestion) * questions.length;
  const scoreMarks = Number(marksPerQuestion) * correctCount;
  const percent = totalMarks > 0 ? (scoreMarks / totalMarks) * 100 : 0;
  const passPercent = typeof attempt.passPercent === "number" ? attempt.passPercent : 60;
  const passed = percent >= passPercent;

  attempt.answers = normalizedAnswers;
  attempt.correctCount = correctCount;
  attempt.totalMarks = totalMarks;
  attempt.scoreMarks = scoreMarks;
  attempt.percent = Math.round(percent * 10) / 10;
  attempt.passed = passed;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();

  await attempt.save();
  return ok(res, { attempt: mapAttemptSummary(attempt) }, "Attempt submitted");
});

export const candidateGetMyLatestJobAssessmentAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id).select({ _id: 1, status: 1 });
  if (!job) throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");
  if (job.status !== "active") throw new ApiError(404, "JOB_NOT_FOUND", "Job not found");

  const myLatest = await JobAssessmentAttempt.findOne({ jobId: job._id, candidateId: req.user._id })
    .sort({ attemptNumber: -1, createdAt: -1 })
    .limit(1);

  return ok(res, { attempt: mapAttemptSummary(myLatest) }, "Attempt");
});
