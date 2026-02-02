import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { SkillAssessmentAttempt } from "../models/SkillAssessmentAttempt.js";
import { generateSkillTest } from "../ai/assessments/generateSkillTest.js";
import { User } from "../models/User.js";
import { applyCandidateAiScoreToUserDoc } from "../utils/aiScore.js";

function normalizeSkillName(v) {
  return String(v || "").trim();
}

function verificationStatusFromAccuracy(accuracy) {
  if (accuracy >= 70) return "verified";
  if (accuracy >= 50) return "partially_verified";
  return "not_verified";
}

function sanitizeQuestionsForClient(questions) {
  return questions.map((q) => ({
    questionId: q.questionId,
    text: q.text,
    options: q.options,
    difficulty: q.difficulty,
  }));
}

export const generateAssessment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  if (req.user.role !== "candidate") throw new ApiError(403, "FORBIDDEN", "Only candidates can take assessments");

  const skillName = normalizeSkillName(req.body?.skillName);
  if (!skillName) throw new ApiError(400, "BAD_REQUEST", "skillName is required");

  const previous = await SkillAssessmentAttempt.find({
    userId: req.user._id,
    skillName,
  })
    .sort({ attemptNumber: -1 })
    .limit(1);

  const attemptNumber = (previous?.[0]?.attemptNumber || 0) + 1;

  // Avoid question repeats across recent attempts (best effort).
  const avoidHashes = await SkillAssessmentAttempt.find({ userId: req.user._id, skillName })
    .sort({ createdAt: -1 })
    .limit(5)
    .select({ questions: 1 })
    .then((rows) => rows.flatMap((r) => (r.questions || []).map((q) => q.hash)).filter(Boolean));

  let questions;
  let provider;
  try {
    const generated = await generateSkillTest({ skillName, avoidHashes });
    questions = generated.questions;
    provider = generated.provider;
  } catch (err) {
    if (err && err.code === "ASSESSMENT_NO_GENERATOR") {
      throw new ApiError(503, "ASSESSMENT_NO_GENERATOR", err.message);
    }
    throw err;
  }

  const attempt = await SkillAssessmentAttempt.create({
    userId: req.user._id,
    skillName,
    attemptNumber,
    status: "in_progress",
    startedAt: new Date(),
    questions,
  });

  return ok(
    res,
    {
      attempt: {
        id: String(attempt._id),
        skillName: attempt.skillName,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        totalQuestions: attempt.questions.length,
        provider,
      },
      questions: sanitizeQuestionsForClient(attempt.questions),
    },
    "Assessment generated"
  );
});

export const submitAssessment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  if (req.user.role !== "candidate") throw new ApiError(403, "FORBIDDEN", "Only candidates can submit assessments");

  const { attemptId } = req.params;
  if (!attemptId) throw new ApiError(400, "BAD_REQUEST", "attemptId is required");

  const attempt = await SkillAssessmentAttempt.findById(attemptId);
  if (!attempt) throw new ApiError(404, "NOT_FOUND", "Assessment attempt not found");
  if (String(attempt.userId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Forbidden");

  if (attempt.submittedAt) {
    throw new ApiError(409, "ALREADY_SUBMITTED", "This assessment has already been submitted");
  }

  const answers = Array.isArray(req.body?.answers) ? req.body.answers : null;
  if (!answers || answers.length !== 10) {
    throw new ApiError(400, "BAD_REQUEST", "answers must be an array of 10 items");
  }

  const violationCount = Number.isFinite(Number(req.body?.violationCount)) ? Number(req.body.violationCount) : 0;
  const autoSubmitted = Boolean(req.body?.autoSubmitted);
  const isFailed = violationCount >= 2 || autoSubmitted;

  const questionMap = new Map(attempt.questions.map((q) => [q.questionId, q]));

  let correct = 0;
  const normalizedAnswers = answers.map((a) => {
    const questionId = String(a?.questionId || "").trim();
    const selectedIndex = Number(a?.selectedIndex);

    if (!questionId) throw new ApiError(400, "BAD_REQUEST", "answer.questionId is required");
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
      throw new ApiError(400, "BAD_REQUEST", "answer.selectedIndex must be 0..3");
    }

    const q = questionMap.get(questionId);
    if (!q) throw new ApiError(400, "BAD_REQUEST", "Unknown questionId in answers");

    if (!isFailed && selectedIndex === q.correctIndex) correct += 1;
    return { questionId, selectedIndex };
  });

  // Accuracy: (Correct / 10) * 100
  const accuracy = isFailed ? 0 : Math.round((correct / 10) * 100);
  const verificationStatus = isFailed ? "not_verified" : verificationStatusFromAccuracy(accuracy);

  attempt.answers = normalizedAnswers;
  attempt.correctCount = isFailed ? 0 : correct;
  attempt.accuracy = accuracy;
  attempt.verificationStatus = verificationStatus;
  attempt.violationCount = Math.max(0, violationCount);
  attempt.autoSubmitted = autoSubmitted;
  attempt.status = isFailed ? "failed" : "submitted";
  attempt.submittedAt = new Date();

  await attempt.save();

  // Sync skill verification flag on user profile (true only when verified).
  // Partially/not verified leave the verified flag false.
  if (!isFailed && verificationStatus === "verified") {
    await User.updateOne(
      { _id: req.user._id, "skills.name": attempt.skillName },
      { $set: { "skills.$.verified": true } }
    );
  }

  // Dynamic AI score: update after any assessment submission.
  const user = await User.findById(req.user._id);
  if (user?.role === "candidate") {
    await applyCandidateAiScoreToUserDoc(user);
    await user.save();
  }

  return ok(
    res,
    {
      result: {
        attemptId: String(attempt._id),
        skillName: attempt.skillName,
        attemptCount: attempt.attemptNumber,
        correctAnswers: isFailed ? 0 : correct,
        totalQuestions: 10,
        accuracy,
        status: verificationStatus,
        violationCount: attempt.violationCount,
        autoSubmitted: attempt.autoSubmitted,
      },
    },
    "Assessment submitted"
  );
});

export const listAssessmentHistory = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");

  const skillName = req.query?.skillName ? normalizeSkillName(req.query.skillName) : null;

  const q = {
    userId: req.user._id,
    ...(skillName ? { skillName } : {}),
  };

  const items = await SkillAssessmentAttempt.find(q)
    .sort({ createdAt: -1 })
    .limit(50)
    .select({
      skillName: 1,
      attemptNumber: 1,
      accuracy: 1,
      verificationStatus: 1,
      correctCount: 1,
      startedAt: 1,
      submittedAt: 1,
      violationCount: 1,
      autoSubmitted: 1,
      status: 1,
      createdAt: 1,
    });

  return ok(
    res,
    {
      items: items.map((a) => ({
        // If an attempt is failed/auto-submitted, treat score as 0 and not verified.
        // This keeps UI consistent even for older records created before this rule.
        id: String(a._id),
        skillName: a.skillName,
        attemptCount: a.attemptNumber,
        accuracy: a.status === "failed" || (a.violationCount || 0) >= 2 || a.autoSubmitted ? 0 : a.accuracy,
        status: a.status === "failed" || (a.violationCount || 0) >= 2 || a.autoSubmitted ? "not_verified" : a.verificationStatus,
        correctAnswers: a.status === "failed" || (a.violationCount || 0) >= 2 || a.autoSubmitted ? 0 : a.correctCount,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        violationCount: a.violationCount,
        autoSubmitted: a.autoSubmitted,
        examStatus: a.status,
        timestamp: a.createdAt,
      })),
    },
    "Assessment history"
  );
});
