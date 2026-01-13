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

// Middleware
app.use(cors());
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
