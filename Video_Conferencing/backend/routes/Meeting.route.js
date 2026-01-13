import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createMeeting,
  deleteMeeting,
  getMeetingByCode,
  getMeetingById,
  listMeetings,
  updateMeeting,
} from "../controller/Meeting.controller.js";

const router = Router();

router.get("/", requireAuth, listMeetings);
router.post("/", requireAuth, createMeeting);
router.get("/code/:meetingCode", requireAuth, getMeetingByCode);
router.get("/:id", requireAuth, getMeetingById);
router.patch("/:id", requireAuth, updateMeeting);
router.delete("/:id", requireAuth, deleteMeeting);

export default router;
