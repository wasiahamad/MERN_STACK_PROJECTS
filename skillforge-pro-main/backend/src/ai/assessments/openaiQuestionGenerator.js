import { env } from "../../config/env.js";

/**
 * OpenAI-based generator.
 *
 * To enable:
 * - set OPENAI_API_KEY
 * - optionally set OPENAI_MODEL (defaults to gpt-4o-mini)
 */
export async function generateWithOpenAI({ skillName, avoidHashes = [] }) {
  if (!env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured");
    err.code = "OPENAI_NOT_CONFIGURED";
    throw err;
  }

  const model = env.OPENAI_MODEL || "gpt-4o-mini";

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

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
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
    const err = new Error(`OpenAI request failed (${resp.status}): ${text}`);
    err.code = "OPENAI_REQUEST_FAILED";
    throw err;
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error("OpenAI returned empty response");
    err.code = "OPENAI_EMPTY";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const err = new Error("OpenAI returned non-JSON content");
    err.code = "OPENAI_INVALID_JSON";
    throw err;
  }

  return parsed;
}
