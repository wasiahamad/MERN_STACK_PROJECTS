import mongoose from "mongoose";

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