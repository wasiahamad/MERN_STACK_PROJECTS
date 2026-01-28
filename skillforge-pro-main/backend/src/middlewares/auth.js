import { ApiError } from "../utils/ApiError.js";
import { verifyAuthToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new ApiError(401, "UNAUTHORIZED", "Missing Bearer token");

    const decoded = verifyAuthToken(token);

    const user = await User.findById(decoded.userId).select("+tokenInvalidBefore");
    if (!user) throw new ApiError(401, "UNAUTHORIZED", "Invalid token");

    if (user.tokenInvalidBefore) {
      const iatMs = decoded.iat ? decoded.iat * 1000 : 0;
      if (iatMs < user.tokenInvalidBefore.getTime()) {
        throw new ApiError(401, "SESSION_INVALIDATED", "Session expired. Please login again.");
      }
    }

    req.auth = {
      userId: String(user._id),
      role: user.role,
      emailVerified: !!user.emailVerified,
    };
    req.user = user;

    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.user?.emailVerified) {
    return next(new ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email"));
  }
  return next();
}

export function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    if (req.user.role !== role) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
    }
    return next();
  };
}
