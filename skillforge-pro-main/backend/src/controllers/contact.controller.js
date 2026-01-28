import { asyncHandler } from "../utils/asyncHandler.js";
import { created } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { env } from "../config/env.js";
import { sendEmail } from "../utils/mailer.js";

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "VALIDATION", "name, email, subject, message are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  if (!isEmail(normalizedEmail)) throw new ApiError(400, "VALIDATION", "Invalid email");

  const n = String(name).trim();
  const s = String(subject).trim();
  const m = String(message).trim();

  if (n.length < 2 || n.length > 100) throw new ApiError(400, "VALIDATION", "name must be 2..100 chars");
  if (s.length < 2 || s.length > 200) throw new ApiError(400, "VALIDATION", "subject must be 2..200 chars");
  if (m.length < 5 || m.length > 5000) throw new ApiError(400, "VALIDATION", "message must be 5..5000 chars");

  const doc = await ContactMessage.create({
    name: n,
    email: normalizedEmail,
    subject: s,
    message: m,
    userId: req.user?._id,
    ip: req.ip || "",
    userAgent: req.get("user-agent") || "",
  });

  if (env.SUPPORT_EMAIL) {
    await sendEmail({
      to: env.SUPPORT_EMAIL,
      subject: `[SkillForge Contact] ${s}`,
      text: `From: ${n} <${normalizedEmail}>\n\n${m}\n\nMessageId: ${doc._id}`,
    });
  }

  return created(res, { id: String(doc._id) }, "Message received");
});
