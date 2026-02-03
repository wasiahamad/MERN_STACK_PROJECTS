import { SkillAssessmentAttempt } from "../models/SkillAssessmentAttempt.js";

const ALIASES = new Map([
  ["js", "javascript"],
  ["javascript", "javascript"],
  ["ts", "typescript"],
  ["typescript", "typescript"],
  ["reactjs", "react"],
  ["react", "react"],
  ["nodejs", "node"],
  ["node", "node"],
  ["expressjs", "express"],
  ["express", "express"],
  ["mongo", "mongodb"],
  ["mongodb", "mongodb"],
  ["mern", "mern stack"],
  ["mernstack", "mern stack"],
  ["mern stack", "mern stack"],

  // broader categories / common phrases
  ["webdev", "web development"],
  ["web development", "web development"],
  ["web developer", "web development"],
  ["frontend", "frontend development"],
  ["front end", "frontend development"],
  ["frontend development", "frontend development"],
  ["backend", "backend development"],
  ["back end", "backend development"],
  ["backend development", "backend development"],
  ["fullstack", "full stack"],
  ["full stack", "full stack"],
  ["full stack development", "full stack"],
  ["api development", "api development"],
  ["rest api", "api development"],
  ["rest", "api development"],
]);

// Conservative taxonomy: allow related/broader skills to count toward job requirements.
// Example: verified "web development" should help match "react" jobs.
const CATEGORY_MEMBERS = new Map([
  [
    "web development",
    [
      "frontend development",
      "backend development",
      "full stack",
      "javascript",
      "typescript",
      "html",
      "css",
      "react",
      "node",
      "express",
      "mongodb",
      "api development",
    ],
  ],
  [
    "frontend development",
    ["javascript", "typescript", "html", "css", "react"],
  ],
  [
    "backend development",
    ["node", "express", "mongodb", "api development"],
  ],
  [
    "full stack",
    ["frontend development", "backend development", "react", "node", "express", "mongodb"],
  ],
  [
    "mern stack",
    ["react", "node", "express", "mongodb", "javascript"],
  ],
]);

function buildExpansions() {
  const expand = new Map();

  for (const [category, members] of CATEGORY_MEMBERS.entries()) {
    const c = normalizeSkillKey(category);
    const ms = members.map((m) => normalizeSkillKey(m)).filter(Boolean);

    // category => members
    const a = expand.get(c) || new Set();
    for (const m of ms) a.add(m);
    expand.set(c, a);

    // member => category (reverse)
    for (const m of ms) {
      const b = expand.get(m) || new Set();
      b.add(c);
      expand.set(m, b);
    }
  }

  return expand;
}

const EXPANDS_TO = buildExpansions();

function expandSkillKeys(verifiedSkillKeys) {
  const out = new Set();
  const queue = [];

  for (const k of verifiedSkillKeys || []) {
    const nk = normalizeSkillKey(k);
    if (!nk) continue;
    if (!out.has(nk)) {
      out.add(nk);
      queue.push(nk);
    }
  }

  while (queue.length) {
    const cur = queue.shift();
    const extras = EXPANDS_TO.get(cur);
    if (!extras) continue;

    for (const e of extras) {
      const ne = normalizeSkillKey(e);
      if (!ne || out.has(ne)) continue;
      out.add(ne);
      queue.push(ne);
    }
  }

  return out;
}

export function normalizeSkillKey(name) {
  const raw = String(name || "").trim().toLowerCase();
  if (!raw) return "";

  // Keep spaces for multi-word skills, but normalize punctuation.
  const compact = raw.replace(/[._-]/g, " ").replace(/\s+/g, " ").trim();
  const aliasKey = compact.replace(/\s+/g, "");

  if (ALIASES.has(compact)) return ALIASES.get(compact);
  if (ALIASES.has(aliasKey)) return ALIASES.get(aliasKey);

  return compact;
}

export function computeSkillMatch({ requiredSkills, verifiedSkillKeys }) {
  const required = Array.isArray(requiredSkills) ? requiredSkills.map((s) => String(s)).filter(Boolean) : [];
  const normalizedRequired = required.map((s) => ({ original: s, key: normalizeSkillKey(s) })).filter((s) => s.key);

  const expandedVerified = expandSkillKeys(verifiedSkillKeys);

  const matched = [];
  const missing = [];

  for (const s of normalizedRequired) {
    if (expandedVerified.has(s.key)) matched.push(s.original);
    else missing.push(s.original);
  }

  const matchScore = normalizedRequired.length
    ? Math.round((matched.length / normalizedRequired.length) * 100)
    : 0;

  return {
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    requiredSkills: normalizedRequired.map((s) => s.original),
  };
}

export async function getVerifiedSkillKeysForCandidate({ userId, legacySkills }) {
  const keys = new Set();

  // Legacy (manual/old) verified flag.
  if (Array.isArray(legacySkills)) {
    for (const s of legacySkills) {
      if (!s || !s.verified) continue;
      const k = normalizeSkillKey(s.name);
      if (k) keys.add(k);
    }
  }

  // AI assessment verified skills.
  const verifiedAttemptSkills = await SkillAssessmentAttempt.distinct("skillName", {
    userId,
    status: "submitted",
    verificationStatus: "verified",
  });

  for (const skillName of verifiedAttemptSkills) {
    const k = normalizeSkillKey(skillName);
    if (k) keys.add(k);
  }

  return keys;
}
