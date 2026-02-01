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
]);

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

  const matched = [];
  const missing = [];

  for (const s of normalizedRequired) {
    if (verifiedSkillKeys.has(s.key)) matched.push(s.original);
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
