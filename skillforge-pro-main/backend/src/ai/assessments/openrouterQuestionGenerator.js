import { env } from "../../config/env.js";
import nodeFetch from "node-fetch";

/**
 * OpenRouter-based generator (OpenAI-compatible Chat Completions).
 *
 * To enable:
 * - set OPENROUTER_API_KEY
 * - optionally set OPENROUTER_MODEL (defaults to openrouter/auto)
 * - optionally set OPENROUTER_BASE_URL (defaults to https://openrouter.ai/api/v1)
 * - optionally set OPENROUTER_HTTP_REFERER / OPENROUTER_APP_TITLE (recommended by OpenRouter)
 */
export async function generateWithOpenRouter({ skillName, avoidHashes = [] }) {
  if (!env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is not configured");
    err.code = "OPENROUTER_NOT_CONFIGURED";
    throw err;
  }

  const fetchFn = globalThis.fetch || nodeFetch;

  const baseUrl = env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const model = env.OPENROUTER_MODEL || "openrouter/auto";

  const system =
    "You generate skill assessment MCQs as strict JSON. " +
    "Return ONLY JSON (no markdown). Use concise, unambiguous wording. " +
    "No repeated questions. Options must be plausible. Exactly one correct answer.";

  const user = {
    skillName,
    rules: {
      total: 10,
      difficultyDistribution: { easy: 5, medium: 3, hard: 2 },
      optionsPerQuestion: 4,
    },
    avoidQuestionHashes: avoidHashes,
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

  const headers = {
    Authorization: `Bearer ${String(env.OPENROUTER_API_KEY).trim()}`,
    "Content-Type": "application/json",
  };

  // Recommended by OpenRouter for higher rate limits / attribution.
  if (env.OPENROUTER_HTTP_REFERER) headers["HTTP-Referer"] = env.OPENROUTER_HTTP_REFERER;
  if (env.OPENROUTER_APP_TITLE) headers["X-Title"] = env.OPENROUTER_APP_TITLE;

  const resp = await fetchFn(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`OpenRouter request failed (${resp.status}): ${text}`);
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
  } catch (e) {
    const err = new Error("OpenRouter returned non-JSON content");
    err.code = "OPENROUTER_INVALID_JSON";
    throw err;
  }

  return parsed;
}
