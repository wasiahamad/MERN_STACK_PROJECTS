import { SkillAssessmentAttempt } from "../models/SkillAssessmentAttempt.js";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseDateLike(v) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffYears(start, end) {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

function computeExperienceYears(experience) {
  const rows = Array.isArray(experience) ? experience : [];
  let total = 0;

  for (const e of rows) {
    const start = parseDateLike(e?.startDate);
    if (!start) continue;

    const end = e?.current ? new Date() : parseDateLike(e?.endDate) || new Date();
    total += diffYears(start, end);
  }

  // Avoid runaway due to overlaps or bad data.
  return clamp(total, 0, 15);
}

function computeProfileCompletionPercent(user) {
  const checks = {
    basicInfo: Boolean(user?.name) && Boolean(user?.email),
    location: Boolean(user?.location),
    about: Boolean(user?.about),
    headline: Boolean(user?.headline),
    skills: (user?.skills?.length ?? 0) > 0,
    experience: (user?.experience?.length ?? 0) > 0,
    education: (user?.education?.length ?? 0) > 0,
    certificates: (user?.certificates?.length ?? 0) > 0,
    socials: Boolean(user?.socials?.github || user?.socials?.linkedin || user?.socials?.website),
    wallet: Boolean(user?.walletAddress),
  };

  const total = Object.keys(checks).length;
  const done = Object.values(checks).filter(Boolean).length;
  return total ? Math.round((done / total) * 100) : 0;
}

async function getAssessmentSkillStats(userId) {
  const facet = await SkillAssessmentAttempt.aggregate([
    {
      $match: {
        userId,
        status: "submitted",
      },
    },
    {
      $facet: {
        verified: [
          { $match: { verificationStatus: "verified" } },
          { $group: { _id: "$skillName", bestAccuracy: { $max: "$accuracy" } } },
          {
            $group: {
              _id: null,
              verifiedSkillCount: { $sum: 1 },
              avgBestAccuracy: { $avg: "$bestAccuracy" },
              bestAccuracyOverall: { $max: "$bestAccuracy" },
            },
          },
        ],
        partial: [
          { $match: { verificationStatus: "partially_verified" } },
          { $group: { _id: "$skillName" } },
          { $group: { _id: null, partialSkillCount: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const v = facet?.[0]?.verified?.[0] || {};
  const p = facet?.[0]?.partial?.[0] || {};

  return {
    verifiedSkillCount: Number(v.verifiedSkillCount || 0),
    avgBestAccuracy: Number.isFinite(Number(v.avgBestAccuracy)) ? Number(v.avgBestAccuracy) : 0,
    bestAccuracyOverall: Number.isFinite(Number(v.bestAccuracyOverall)) ? Number(v.bestAccuracyOverall) : 0,
    partialSkillCount: Number(p.partialSkillCount || 0),
  };
}

export async function computeCandidateAiScoreBreakdown(userDoc) {
  const assessment = await getAssessmentSkillStats(userDoc._id);

  const yearsExp =
    typeof userDoc?.yearsOfExperience === "number" && Number.isFinite(userDoc.yearsOfExperience)
      ? clamp(userDoc.yearsOfExperience, 0, 60)
      : computeExperienceYears(userDoc.experience);
  const profileCompletion = computeProfileCompletionPercent(userDoc);

  const certs = Array.isArray(userDoc.certificates) ? userDoc.certificates : [];
  const verifiedCertCount = certs.filter((c) => c?.verified).length;
  const nftMintedCount = certs.filter((c) => c?.nftMinted).length;

  // Score components (0..100). This is deterministic and explainable.
  const base = 10;
  const skillComponent = clamp(
    Math.round(assessment.verifiedSkillCount * 8 + assessment.avgBestAccuracy * 0.3),
    0,
    55
  );
  const partialComponent = clamp(assessment.partialSkillCount * 2, 0, 10);
  const experienceComponent = clamp(Math.round(yearsExp * 4), 0, 20);
  const certificateComponent = clamp(verifiedCertCount * 2 + nftMintedCount * 1, 0, 10);
  const profileComponent = clamp(Math.round(profileCompletion / 20), 0, 5);

  const total = clamp(
    base + skillComponent + partialComponent + experienceComponent + certificateComponent + profileComponent,
    0,
    100
  );

  return {
    aiScore: total,
    breakdown: {
      base,
      skillComponent,
      partialComponent,
      experienceComponent,
      certificateComponent,
      profileComponent,
      inputs: {
        verifiedSkillCount: assessment.verifiedSkillCount,
        avgBestAccuracy: Math.round(assessment.avgBestAccuracy),
        bestAccuracyOverall: Math.round(assessment.bestAccuracyOverall),
        partialSkillCount: assessment.partialSkillCount,
        yearsExperience: Number(yearsExp.toFixed(2)),
        verifiedCertCount,
        nftMintedCount,
        profileCompletion,
      },
    },
  };
}

export async function applyCandidateAiScoreToUserDoc(userDoc) {
  const { aiScore, breakdown } = await computeCandidateAiScoreBreakdown(userDoc);
  userDoc.aiScore = aiScore;
  return { aiScore, breakdown };
}
