import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import User from "../model/User.model.js";

function readToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice("bearer ".length).trim();
  }

  // Fallbacks for Zoom-main-style calls (query/body token)
  if (typeof req.query?.token === "string") return req.query.token;
  if (typeof req.body?.token === "string") return req.body.token;
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Missing auth token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(userId).select("_id username email");
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
      error: error.message,
    });
  }
}
