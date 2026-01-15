import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/Db.js';
import { initSocket } from './controller/SonnetManager.js';
import userRoutes from './routes/User.route.js';
import meetingRoutes from './routes/Meeting.route.js';
dotenv.config();

const app = express();
const server = createServer(app);

initSocket(server);

function normalizeOrigin(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
        return new URL(raw).origin;
    } catch {
        return raw.replace(/\/+$/, "");
    }
}

function parseAllowedOrigins() {
    const raw = String(process.env.FRONTEND_URL || process.env.CLIENT_URL || "").trim();
    const defaults = ["http://localhost:5173", "http://localhost:3000"];
    if (!raw) return defaults;
    const list = raw
        .split(",")
        .map((s) => normalizeOrigin(s))
        .filter(Boolean);
    const normalizedDefaults = defaults.map(normalizeOrigin);
    return list.length ? list : normalizedDefaults;
}

const allowedOrigins = parseAllowedOrigins();
const allowedOriginSet = new Set(allowedOrigins.map(normalizeOrigin));

// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // allow non-browser clients (no Origin header)
            if (!origin) return callback(null, true);
            const normalized = normalizeOrigin(origin);
            return callback(null, allowedOriginSet.has(normalized));
        },
        credentials: true,
    })
);
app.use(express.json({limit: '40kb'}));
app.use(express.urlencoded({limit: '40kb', extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.send('Video Conferencing Server Running');
});

// Routes
app.use('/api/users', userRoutes); 
app.use('/api/meetings', meetingRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    // db connection can be initiated here if needed
    connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
});
