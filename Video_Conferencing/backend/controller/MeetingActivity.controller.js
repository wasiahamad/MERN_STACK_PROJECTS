import httpStatus from "http-status";
import MeetingActivity from "../model/MeetingActivity.model.js";

export const addToActivity = async (req, res) => {
  try {
    const meetingCode = String(req.body?.meeting_code || req.body?.meetingCode || "").trim();
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "Meeting";

    if (!meetingCode) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "meeting_code is required",
      });
    }

    const activity = await MeetingActivity.create({
      userId: req.user._id,
      meetingCode,
      title: title || "Meeting",
    });

    return res.status(httpStatus.CREATED).json({
      success: true,
      message: "Added to activity",
      activity: {
        id: activity._id,
        meetingCode: activity.meetingCode,
        title: activity.title,
        createdAt: activity.createdAt,
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

export const getAllActivity = async (req, res) => {
  try {
    const rows = await MeetingActivity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(httpStatus.OK).json({
      success: true,
      meetings: rows.map((r) => ({
        id: String(r._id),
        title: r.title,
        roomId: r.meetingCode,
        createdAt: r.createdAt,
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
