import express from "express";
import { getAllRecruiters, getAllUsers } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
  }
  next();
}

// Admin routes - all require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get("/recruiters", getAllRecruiters);
router.get("/users", getAllUsers);

export default router;
