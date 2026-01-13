import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment');
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

