import mongoose from "mongoose";

const meetingParticipantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["host", "cohost", "participant"],
            default: "participant",
            index: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        lastJoinedAt: {
            type: Date,
            default: Date.now,
        },
        lastLeftAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Additive: meeting-scoped host/cohost/participant roles
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        default: null,
    },
    coHosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        default: [],
    }],
    locked: {
        type: Boolean,
        default: false,
        index: true,
    },
    participants: {
        type: [meetingParticipantSchema],
        default: [],
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    duration: {
        type: Number,
        required: true,
        default: 45,
    },
    meetingCode: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

export default mongoose.model("Meeting", meetingSchema, "meetings", () => {
    console.log("Connected to meetings collection");
});