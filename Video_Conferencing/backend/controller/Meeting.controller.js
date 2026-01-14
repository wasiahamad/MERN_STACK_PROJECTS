import httpStatus from "http-status";
import crypto from "crypto";
import mongoose from "mongoose";
import Meeting from "../model/Meeting.model.js";
import { getIO } from "./SonnetManager.js";

function toIdString(value) {
  if (!value) return "";
  return typeof value === "string" ? value : String(value);
}

function getHostId(meeting) {
  return meeting?.hostId || meeting?.user_id || null;
}

function hasUserId(list, userId) {
  const id = toIdString(userId);
  if (!id) return false;
  if (!Array.isArray(list)) return false;
  return list.some((v) => toIdString(v) === id);
}

function getMeetingRole(meeting, userId) {
  const id = toIdString(userId);
  if (!id || !meeting) return "none";

  const hostId = toIdString(getHostId(meeting));
  if (hostId && hostId === id) return "host";

  if (hasUserId(meeting.coHosts, id)) return "cohost";
  if (Array.isArray(meeting.participants) && meeting.participants.some((p) => toIdString(p?.userId) === id)) {
    return "participant";
  }
  return "participant";
}

function serializeRoles(meeting) {
  const participants = Array.isArray(meeting.participants)
    ? meeting.participants.map((p) => ({
        userId: toIdString(p.userId),
        role: String(p.role || "participant"),
      }))
    : [];

  return {
    meetingId: toIdString(meeting._id),
    roomId: toIdString(meeting.meetingCode),
    locked: Boolean(meeting.locked),
    hostId: toIdString(getHostId(meeting)),
    coHosts: Array.isArray(meeting.coHosts) ? meeting.coHosts.map((id) => toIdString(id)) : [],
    participants,
  };
}

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
      hostId: req.user._id,
      coHosts: [],
      locked: false,
      participants: [
        {
          userId: req.user._id,
          role: "host",
          joinedAt: new Date(),
          lastJoinedAt: new Date(),
          lastLeftAt: null,
        },
      ],
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

export const lockMeeting = async (req, res) => {
  try {
    const meetingId = String(req.params?.id || "").trim();
    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid meeting id" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    const role = getMeetingRole(meeting, req.user?._id);
    if (role !== "host") {
      return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "Only host can lock meeting" });
    }

    if (!meeting.hostId) meeting.hostId = meeting.user_id;
    if (!meeting.locked) {
      meeting.locked = true;
      await meeting.save();
    }

    const io = getIO();
    if (io) {
      io.to(String(meeting.meetingCode)).emit("meeting-locked", {
        meetingId: String(meeting._id),
        roomId: String(meeting.meetingCode),
        locked: true,
      });
    }

    return res.status(httpStatus.OK).json({ success: true, locked: true });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const unlockMeeting = async (req, res) => {
  try {
    const meetingId = String(req.params?.id || "").trim();
    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid meeting id" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    const role = getMeetingRole(meeting, req.user?._id);
    if (role !== "host") {
      return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "Only host can unlock meeting" });
    }

    if (!meeting.hostId) meeting.hostId = meeting.user_id;
    if (meeting.locked) {
      meeting.locked = false;
      await meeting.save();
    }

    const io = getIO();
    if (io) {
      io.to(String(meeting.meetingCode)).emit("meeting-unlocked", {
        meetingId: String(meeting._id),
        roomId: String(meeting.meetingCode),
        locked: false,
      });
    }

    return res.status(httpStatus.OK).json({ success: true, locked: false });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const assignCohost = async (req, res) => {
  try {
    const meetingId = String(req.params?.id || "").trim();
    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Invalid meeting id" });
    }

    const targetUserId = String(req.body?.userId || "").trim();
    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "userId is required" });
    }

    const action = String(req.body?.action || "assign").toLowerCase();
    const isRemove = action === "remove" || action === "unassign";

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Meeting not found" });
    }

    const role = getMeetingRole(meeting, req.user?._id);
    if (role !== "host") {
      return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "Only host can manage co-hosts" });
    }

    const hostId = toIdString(getHostId(meeting));
    if (hostId && hostId === toIdString(targetUserId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Host cannot be a co-host" });
    }

    if (!meeting.hostId) meeting.hostId = meeting.user_id;
    if (!Array.isArray(meeting.coHosts)) meeting.coHosts = [];
    if (!Array.isArray(meeting.participants)) meeting.participants = [];

    const existsCohost = hasUserId(meeting.coHosts, targetUserId);
    if (isRemove) {
      if (existsCohost) {
        meeting.coHosts = meeting.coHosts.filter((id) => toIdString(id) !== toIdString(targetUserId));
      }
    } else {
      if (!existsCohost) meeting.coHosts.push(targetUserId);
    }

    // Sync participant role metadata
    const pIdx = meeting.participants.findIndex((p) => toIdString(p?.userId) === toIdString(targetUserId));
    if (pIdx >= 0) {
      meeting.participants[pIdx].role = isRemove ? "participant" : "cohost";
    } else {
      meeting.participants.push({
        userId: targetUserId,
        role: isRemove ? "participant" : "cohost",
        joinedAt: new Date(),
        lastJoinedAt: new Date(),
        lastLeftAt: null,
      });
    }

    await meeting.save();

    const io = getIO();
    if (io) {
      io.to(String(meeting.meetingCode)).emit("meeting-roles-updated", serializeRoles(meeting));
    }

    return res.status(httpStatus.OK).json({
      success: true,
      roles: serializeRoles(meeting),
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

// getMeetingHistory removed (MeetingActivity removed)
