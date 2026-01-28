import crypto from "crypto";
import { env } from "../config/env.js";

export function randomOtp6() {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, "0");
}

export function hashOtp(otp) {
  return crypto.createHmac("sha256", env.JWT_SECRET).update(String(otp)).digest("hex");
}
