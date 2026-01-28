import { verifyAuthToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function optionalAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return next();

    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return next();

    req.user = user;
    req.auth = {
      userId: String(user._id),
      role: user.role,
      emailVerified: !!user.emailVerified,
    };

    return next();
  } catch {
    return next();
  }
}
