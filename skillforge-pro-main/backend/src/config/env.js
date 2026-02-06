import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  CORS_ORIGIN: (() => {
    const raw = process.env.CORS_ORIGIN;
    if (!raw) return "http://localhost:8080";

    const parts = String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length <= 1) return parts[0] || "http://localhost:8080";
    return parts;
  })(),

  MONGO_URI: required("MONGO_URI"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 10),
  OTP_VERIFY_MAX_ATTEMPTS: Number(process.env.OTP_VERIFY_MAX_ATTEMPTS || 5),
  OTP_RESEND_MAX: Number(process.env.OTP_RESEND_MAX || 5),

  EMAIL_FROM: process.env.EMAIL_FROM || "SkillForge <no-reply@skillforge.local>",
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Cloudinary (support legacy CLOUDNARY_* env names)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_NAME || process.env.CLOUDNARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.CLOUDNARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDNARY_API_SECRET,

  // AI - used for Skill Verification & Assessment (OpenRouter)
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
  OPENROUTER_MAX_TOKENS: process.env.OPENROUTER_MAX_TOKENS,
  OPENROUTER_HTTP_REFERER: process.env.OPENROUTER_HTTP_REFERER,
  OPENROUTER_APP_TITLE: process.env.OPENROUTER_APP_TITLE,

  // Blockchain (optional; feature-flagged)
  BLOCKCHAIN_ENABLED: String(process.env.BLOCKCHAIN_ENABLED || "").toLowerCase() === "true",
  BLOCKCHAIN_NETWORK: process.env.BLOCKCHAIN_NETWORK || "polygon-amoy",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL,
  BLOCKCHAIN_PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY,
  BLOCKCHAIN_EXPLORER_BASE_URL: process.env.BLOCKCHAIN_EXPLORER_BASE_URL || "",
  CERTIFICATE_REGISTRY_ADDRESS: process.env.CERTIFICATE_REGISTRY_ADDRESS,
  DAO_GOVERNANCE_ADDRESS: process.env.DAO_GOVERNANCE_ADDRESS,
};
