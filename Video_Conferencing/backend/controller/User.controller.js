import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";

// Register a new user
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "All fields are required" ,
                success: false
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "User already exists",
                success: false
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                name: newUser.name || "",
                avatarUrl: newUser.avatarUrl || "",
            },
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Server error", 
            error: error.message,
            success: false 
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "All fields are required",
                success: false
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "Invalid credentials",
                success: false
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "Invalid credentials",
                success: false
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(httpStatus.OK).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name || "",
                avatarUrl: user.avatarUrl || "",
            },
            success: true
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Server error", 
            error: error.message,
            success: false 
        });
    }
};

// Get current user profile
export const me = async (req, res) => {
    return res.status(httpStatus.OK).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            name: req.user.name || "",
            avatarUrl: req.user.avatarUrl || "",
        },
    });
};

// Update current user profile
export const updateMe = async (req, res) => {
    try {
        const updates = {};

        if (typeof req.body?.name === "string") updates.name = req.body.name.trim();
        if (typeof req.body?.avatarUrl === "string") updates.avatarUrl = req.body.avatarUrl.trim();
        if (typeof req.body?.email === "string") updates.email = req.body.email.trim();
        if (typeof req.body?.username === "string") updates.username = req.body.username.trim();

        if (typeof req.body?.password === "string" && req.body.password.trim().length >= 6) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password.trim(), salt);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "No valid fields to update",
            });
        }

        // Uniqueness checks
        if (updates.email) {
            const existingEmail = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
            if (existingEmail) {
                return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Email already in use" });
            }
        }
        if (updates.username) {
            const existingUsername = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
            if (existingUsername) {
                return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Username already in use" });
            }
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select(
            "_id username email name avatarUrl"
        );

        return res.status(httpStatus.OK).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name || "",
                avatarUrl: user.avatarUrl || "",
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