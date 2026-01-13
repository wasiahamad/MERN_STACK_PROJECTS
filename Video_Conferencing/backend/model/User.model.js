import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatarUrl: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema, "users", () => {
    console.log("Connected to users collection");
});

