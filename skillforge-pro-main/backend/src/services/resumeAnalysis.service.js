import nodeFetch from "node-fetch";
import { env } from "../config/env.js";
import { normalizeSkillKey } from "../utils/skillMatching.js";

function uniqStrings(items) {
  const out = [];
  const seen = new Set();
  for (const raw of items || []) {
    const s = String(raw || "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function toSkillKeys(skills) {
  const keys = new Set();
  for (const s of skills || []) {
    const k = normalizeSkillKey(s);
    if (k) keys.add(k);
  }
  return Array.from(keys);
}

function heuristicExtractSkills(text) {
  const t = String(text || "").toLowerCase();
  if (!t) return [];

  // Small, high-signal vocabulary aligned with the app's matcher aliases/categories.
  const vocab = [
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "mongodb",
    "mern stack",
    "html",
    "css",
    "api development",
    "rest api",
    "sql",
    "postgres",
    "mysql",
    "python",
    "java",
    "c++",
    "aws",
    "docker",
    "kubernetes",
    "git",
  ];

  const found = [];
  for (const v of vocab) {
    const needle = v.toLowerCase();
    if (t.includes(needle)) found.push(v);
  }

  return uniqStrings(found);
}

async function analyzeWithOpenRouter({ text }) {
  if (!env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is not configured");
    err.code = "OPENROUTER_NOT_CONFIGURED";
    throw err;
  }

  const fetchFn = globalThis.fetch || nodeFetch;
  const baseUrl = env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const model = env.OPENROUTER_MODEL || "openrouter/auto";

  const system =
    "You extract structured candidate profile signals from raw resume text. " +
    "Return ONLY JSON (no markdown). " +
    "Do not invent facts. If something is not present, return an empty string or empty array.";

  const user = {
    task: "resume_profile_extraction",
    input: {
      // keep prompt small-ish: server already caps the text length
      resumeText: text,
    },
    outputSchema: {
      skills: ["string"],
      headlineHint: "string",
      locationHint: "string",
      summary: "string",
    },
    rules: {
      maxSkills: 40,
      skillsShouldBeConcrete: true,
      noDuplicates: true,
    },
  };

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
      temperature: 0.2,
      max_tokens: Number(env.OPENROUTER_MAX_TOKENS || 900),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) },
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

  const skills = uniqStrings(Array.isArray(parsed?.skills) ? parsed.skills : []);

  return {
    provider: "openrouter",
    skills,
    skillKeys: toSkillKeys(skills),
    headlineHint: String(parsed?.headlineHint || "").trim(),
    locationHint: String(parsed?.locationHint || "").trim(),
    summary: String(parsed?.summary || "").trim(),
  };
}

export async function analyzeResumeText({ text }) {
  const safeText = String(text || "").trim();
  if (!safeText) {
    return {
      provider: "heuristic",
      skills: [],
      skillKeys: [],
      headlineHint: "",
      locationHint: "",
      summary: "",
    };
  }

  // Prefer OpenRouter if configured; fallback to heuristic extraction.
  try {
    if (env.OPENROUTER_API_KEY) {
      return await analyzeWithOpenRouter({ text: safeText });
    }
  } catch {
    // swallow and fallback
  }

  const skills = heuristicExtractSkills(safeText);
  return {
    provider: "heuristic",
    skills,
    skillKeys: toSkillKeys(skills),
    headlineHint: "",
    locationHint: "",
    summary: "",
  };
}
