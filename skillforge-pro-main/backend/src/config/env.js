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
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

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
};
