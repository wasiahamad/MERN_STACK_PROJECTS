import crypto from "crypto";
import { generateWithOpenAI } from "./openaiQuestionGenerator.js";
import { FALLBACK_QUESTION_BANK, normalizeSkillName } from "./fallbackQuestionBank.js";

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "").trim().toLowerCase()).digest("hex");
}

function stableQuestionId(skillName, text) {
  const base = `${normalizeSkillName(skillName)}::${String(text || "").trim().toLowerCase()}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}

function pickUnique(source, count, usedHashes, difficulty) {
  const out = [];
  for (const q of source) {
    if (out.length >= count) break;
    const h = hashText(q.text);
    if (usedHashes.has(h)) continue;
    usedHashes.add(h);
    out.push({ ...q, difficulty, hash: h });
  }
  return out;
}

function validateAndNormalize({ skillName, raw }) {
  const questions = raw?.questions;
  if (!Array.isArray(questions)) throw new Error("AI_OUTPUT_INVALID: questions must be an array");
  if (questions.length !== 10) throw new Error("AI_OUTPUT_INVALID: must return exactly 10 questions");

  const normalized = questions.map((q) => {
    const text = String(q.text || "").trim();
    const difficulty = String(q.difficulty || "").trim().toLowerCase();
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o || "").trim()) : [];
    const correctIndex = Number(q.correctIndex);

    if (!text) throw new Error("AI_OUTPUT_INVALID: question text missing");
    if (!/^(easy|medium|hard)$/.test(difficulty)) throw new Error("AI_OUTPUT_INVALID: invalid difficulty");
    if (options.length !== 4) throw new Error("AI_OUTPUT_INVALID: each question must have 4 options");
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error("AI_OUTPUT_INVALID: correctIndex must be 0..3");
    }

    const hash = hashText(text);
    return {
      questionId: stableQuestionId(skillName, text),
      text,
      difficulty,
      options,
      correctIndex,
      hash,
    };
  });

  const diffCounts = normalized.reduce(
    (acc, q) => {
      acc[q.difficulty] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  if (diffCounts.easy !== 5 || diffCounts.medium !== 3 || diffCounts.hard !== 2) {
    throw new Error("AI_OUTPUT_INVALID: difficulty distribution must be 5 easy, 3 medium, 2 hard");
  }

  const uniqueHashes = new Set(normalized.map((q) => q.hash));
  if (uniqueHashes.size !== 10) throw new Error("AI_OUTPUT_INVALID: duplicate questions detected");

  return normalized;
}

export async function generateSkillTest({ skillName, avoidHashes = [] }) {
  const used = new Set(avoidHashes);
  const skillKey = normalizeSkillName(skillName);

  // Prefer AI
  try {
    const raw = await generateWithOpenAI({ skillName, avoidHashes });
    const normalized = validateAndNormalize({ skillName, raw });
    // Add hashes to used to help callers (optional).
    normalized.forEach((q) => used.add(q.hash));
    return { questions: normalized, provider: "openai" };
  } catch (err) {
    // Fall back to bank if available.
    const bank = FALLBACK_QUESTION_BANK[skillKey];
    if (!bank) {
      const e = new Error(
        "AI generation unavailable and no fallback questions exist for this skill. Configure OPENAI_API_KEY or add a fallback bank." 
      );
      e.code = "ASSESSMENT_NO_GENERATOR";
      throw e;
    }

    const easy = pickUnique(bank.easy, 5, used, "easy");
    const medium = pickUnique(bank.medium, 3, used, "medium");
    const hard = pickUnique(bank.hard, 2, used, "hard");
    const merged = [...easy, ...medium, ...hard];
    if (merged.length !== 10) {
      const e = new Error("Fallback bank does not have enough unique questions");
      e.code = "ASSESSMENT_FALLBACK_INSUFFICIENT";
      throw e;
    }

    const normalized = merged.map((q) => ({
      questionId: stableQuestionId(skillName, q.text),
      text: q.text,
      difficulty: q.difficulty,
      options: q.options,
      correctIndex: q.correctIndex,
      hash: q.hash,
    }));

    return { questions: normalized, provider: "fallback" };
  }
}
