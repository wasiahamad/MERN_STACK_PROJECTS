import mongoose from "mongoose";

const meetingActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      default: "",
      index: true,
    },
    meetingCode: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Meeting",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    leftAt: {
      type: Date,
      default: null,
      index: true,
    },
    socketId: {
      type: String,
      default: "",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MeetingActivity", meetingActivitySchema, "meeting_activity");
