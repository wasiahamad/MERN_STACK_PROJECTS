import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const hasSmtp = env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS;
  const looksLikePlaceholder =
    String(env.SMTP_USER || "").includes("your_email") || String(env.SMTP_PASS || "").includes("your_app_password");
  if (!hasSmtp) {
    transporter = null;
    return transporter;
  }

  if (looksLikePlaceholder) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, text }) {
  const tx = getTransporter();

  if (!tx) {
    if (env.NODE_ENV === "production") {
      throw new ApiError(500, "EMAIL_NOT_CONFIGURED", "Email provider not configured");
    }

    // Dev fallback: log OTP/email
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to, subject, text });
    return;
  }

  try {
    await tx.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (err) {
    if (env.NODE_ENV === "production") {
      throw new ApiError(502, "EMAIL_SEND_FAILED", "Failed to send email");
    }

    // Dev fallback: SMTP exists but is misconfigured (common locally)
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL SEND FAILED]", err?.message || err);
    // eslint-disable-next-line no-console
    console.log("[DEV EMAIL]", { to, subject, text });
    return;
  }
}

export async function sendOtpEmail({ to, otp, purpose }) {
  const subject = purpose === "signup" ? "Verify your email" : "Password reset code";
  const text =
    purpose === "signup"
      ? `Your SkillForge email verification code is: ${otp}. It expires soon.`
      : `Your SkillForge password reset code is: ${otp}. It expires soon.`;

  await sendEmail({ to, subject, text });
}
