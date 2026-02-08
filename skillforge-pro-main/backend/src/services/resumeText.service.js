import fs from "fs/promises";
import crypto from "crypto";
import pdfParse from "pdf-parse";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text || ""), "utf8").digest("hex");
}

function normalizeExtractedText(text) {
  // Keep it deterministic and safe: normalize whitespace and cap size.
  const t = String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Prevent very large prompts / DB fields.
  const maxChars = 60_000;
  return t.length > maxChars ? t.slice(0, maxChars) : t;
}

export async function extractPdfTextFromFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  const text = normalizeExtractedText(data?.text || "");
  return { text, textHash: sha256(text) };
}
