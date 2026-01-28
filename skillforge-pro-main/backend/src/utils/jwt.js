import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAuthToken(user) {
  return jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
      emailVerified: !!user.emailVerified,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
