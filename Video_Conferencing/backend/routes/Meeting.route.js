import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createMeeting,
  deleteMeeting,
  getMeetingByCode,
  getMeetingById,
  listMeetings,
  lockMeeting,
  unlockMeeting,
  assignCohost,
  updateMeeting,
} from "../controller/Meeting.controller.js";

const router = Router();

router.get("/", requireAuth, listMeetings);
router.post("/", requireAuth, createMeeting);
router.get("/code/:meetingCode", requireAuth, getMeetingByCode);
router.get("/:id", requireAuth, getMeetingById);

// Additive: meeting controls
router.post("/:id/lock", requireAuth, lockMeeting);
router.post("/:id/unlock", requireAuth, unlockMeeting);
router.post("/:id/assign-cohost", requireAuth, assignCohost);

router.patch("/:id", requireAuth, updateMeeting);
router.delete("/:id", requireAuth, deleteMeeting);

export default router;
