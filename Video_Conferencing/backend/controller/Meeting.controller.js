import httpStatus from "http-status";
import crypto from "crypto";
import Meeting from "../model/Meeting.model.js";

function computeStatus(meeting) {
  const start = meeting.date ? new Date(meeting.date).getTime() : 0;
  const durationMin = Number(meeting.duration || 0);
  const end = start + durationMin * 60 * 1000;
  if (!start || !durationMin) return "instant";
  return end < Date.now() ? "completed" : "scheduled";
}

async function generateUniqueCode() {
  for (let i = 0; i < 6; i++) {
    const code = crypto.randomBytes(6).toString("base64url").toLowerCase();
    // keep it short-ish and URL friendly
    const meetingCode = code.replace(/[^a-z0-9]/g, "").slice(0, 10);
    if (!meetingCode) continue;
    const exists = await Meeting.exists({ meetingCode });
    if (!exists) return meetingCode;
  }
  // fallback
  return crypto.randomBytes(8).toString("hex").slice(0, 10);
}

export const createMeeting = async (req, res) => {
  try {
    const title = String(req.body?.title || "Meeting").trim() || "Meeting";
    const duration = Number(req.body?.duration ?? 45);
    const dateRaw = req.body?.date;
    const date = dateRaw ? new Date(dateRaw) : new Date();

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "duration must be a positive number",
      });
    }

    if (Number.isNaN(date.getTime())) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid date",
      });
    }

    const meetingCode = await generateUniqueCode();

    const meeting = await Meeting.create({
      title,
      user_id: req.user._id,
      date,
      duration,
      meetingCode,
    });

    return res.status(httpStatus.CREATED).json({
      success: true,
      meeting: {
        id: String(meeting._id),
        title: meeting.title,
        roomId: meeting.meetingCode,
        createdAt: meeting.createdAt,
        scheduledAt: meeting.date,
        duration: meeting.duration,
        status: computeStatus(meeting),
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const listMeetings = async (req, res) => {
  try {
    const rows = await Meeting.find({ user_id: req.user._id }).sort({ date: -1 }).limit(50);
    return res.status(httpStatus.OK).json({
      success: true,
      meetings: rows.map((m) => ({
        id: String(m._id),
        title: m.title,
        roomId: m.meetingCode,
        createdAt: m.createdAt,
        scheduledAt: m.date,
        duration: m.duration,
        status: computeStatus(m),
      })),
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      meeting: {
        id: String(meeting._id),
        title: meeting.title,
        roomId: meeting.meetingCode,
        createdAt: meeting.createdAt,
        scheduledAt: meeting.date,
        duration: meeting.duration,
        status: computeStatus(meeting),
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMeetingByCode = async (req, res) => {
  try {
    const meetingCode = String(req.params.meetingCode || "").trim();
    if (!meetingCode) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "meetingCode required" });
    }

    const meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      meeting: {
        id: String(meeting._id),
        title: meeting.title,
        roomId: meeting.meetingCode,
        createdAt: meeting.createdAt,
        scheduledAt: meeting.date,
        duration: meeting.duration,
        status: computeStatus(meeting),
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body?.title === "string") updates.title = req.body.title.trim() || "Meeting";
    if (req.body?.date) {
      const d = new Date(req.body.date);
      if (Number.isNaN(d.getTime())) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid date" });
      }
      updates.date = d;
    }
    if (req.body?.duration !== undefined) {
      const duration = Number(req.body.duration);
      if (!Number.isFinite(duration) || duration <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid duration" });
      }
      updates.duration = duration;
    }

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      meeting: {
        id: String(meeting._id),
        title: meeting.title,
        roomId: meeting.meetingCode,
        createdAt: meeting.createdAt,
        scheduledAt: meeting.date,
        duration: meeting.duration,
        status: computeStatus(meeting),
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const deleted = await Meeting.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }
    return res.status(httpStatus.OK).json({ success: true });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
