import crypto from "crypto";
import nodeFetch from "node-fetch";
import { env } from "../../config/env.js";

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "").trim().toLowerCase()).digest("hex");
}

function stableQuestionId(jobId, text) {
  const base = `${String(jobId)}::${String(text || "").trim().toLowerCase()}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}

function validateAndNormalize({ jobId, raw, total = 10 }) {
  const questions = raw?.questions;
  if (!Array.isArray(questions)) throw new Error("AI_OUTPUT_INVALID: questions must be an array");
  if (questions.length !== total) throw new Error(`AI_OUTPUT_INVALID: must return exactly ${total} questions`);

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
      questionId: stableQuestionId(jobId, text),
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

  // Keep same distribution as skill tests (helps quality)
  if (diffCounts.easy !== 5 || diffCounts.medium !== 3 || diffCounts.hard !== 2) {
    throw new Error("AI_OUTPUT_INVALID: difficulty distribution must be 5 easy, 3 medium, 2 hard");
  }

  const uniqueHashes = new Set(normalized.map((q) => q.hash));
  if (uniqueHashes.size !== total) throw new Error("AI_OUTPUT_INVALID: duplicate questions detected");

  return normalized;
}

async function generateWithOpenRouter({ prompt }) {
  if (!env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is not configured");
    err.code = "OPENROUTER_NOT_CONFIGURED";
    throw err;
  }

  const fetchFn = globalThis.fetch || nodeFetch;
  const baseUrl = env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const model = env.OPENROUTER_MODEL || "openrouter/auto";

  const headers = {
    Authorization: `Bearer ${String(env.OPENROUTER_API_KEY).trim()}`,
    "Content-Type": "application/json",
  };
  if (env.OPENROUTER_HTTP_REFERER) headers["HTTP-Referer"] = env.OPENROUTER_HTTP_REFERER;
  if (env.OPENROUTER_APP_TITLE) headers["X-Title"] = env.OPENROUTER_APP_TITLE;

  const resp = await fetchFn(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: Number(env.OPENROUTER_MAX_TOKENS || 1400),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate job screening MCQs as strict JSON only (no markdown). " +
            "Questions must match the job requirements and required skills. " +
            "Exactly one correct answer per question. Options must be plausible. No repeats.",
        },
        { role: "user", content: JSON.stringify(prompt) },
      ],
    }),
  });

  if (!resp.ok) {
    let message = "";
    try {
      const data = await resp.json();
      message = String(data?.error?.message || "").trim();
    } catch {
      message = String(await resp.text().catch(() => "")).trim();
    }
    if (message.length > 600) message = message.slice(0, 600) + "…";
    const err = new Error(`OpenRouter request failed (${resp.status}): ${message || "Unknown error"}`);
    err.code = "OPENROUTER_REQUEST_FAILED";
    throw err;
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error("OpenRouter returned empty response");
    err.code = "OPENROUTER_EMPTY";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const err = new Error("OpenRouter returned non-JSON content");
    err.code = "OPENROUTER_INVALID_JSON";
    throw err;
  }

  return parsed;
}

export async function generateJobAssessment({ jobId, jobTitle, requiredSkills = [], description = "" }) {
  const prompt = {
    jobTitle: String(jobTitle || "").trim(),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.map((s) => String(s)) : [],
    jobDescription: String(description || "").slice(0, 2500),
    rules: {
      total: 10,
      difficultyDistribution: { easy: 5, medium: 3, hard: 2 },
      optionsPerQuestion: 4,
    },
    outputSchema: {
      questions: [
        {
          text: "string",
          difficulty: "easy|medium|hard",
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
        },
      ],
    },
  };

  const raw = await generateWithOpenRouter({ prompt });
  const questions = validateAndNormalize({ jobId, raw, total: 10 });
  return { questions, provider: "openrouter" };
}
