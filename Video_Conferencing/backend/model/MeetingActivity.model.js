import mongoose from "mongoose";

const meetingActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("MeetingActivity", meetingActivitySchema, "meeting_activity");
