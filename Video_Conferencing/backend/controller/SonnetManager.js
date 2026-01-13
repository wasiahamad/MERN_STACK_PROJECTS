import { Server } from 'socket.io';
import jwt from "jsonwebtoken";
import MeetingActivity from "../model/MeetingActivity.model.js";

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
        },
    });

    // --- Room state (supports both your current frontend events + Zoom-main events) ---
    const roomToSockets = new Map(); // roomId -> Set<socketId>
    const socketToRoom = new Map(); // socketId -> roomId

    const readHandshakeToken = (socket) => {
        const authToken = socket?.handshake?.auth?.token;
        if (typeof authToken === "string" && authToken.trim()) return authToken.trim();

        const queryToken = socket?.handshake?.query?.token;
        if (typeof queryToken === "string" && queryToken.trim()) return queryToken.trim();
        return null;
    };

    const getSocketUser = (socket) => {
        try {
            const token = readHandshakeToken(socket);
            if (!token) return null;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.id) return null;
            return {
                id: String(decoded.id),
                username: String(decoded.username || ""),
            };
        } catch {
            return null;
        }
    };

    const joinRoom = async (socket, roomId, payload) => {
        if (!roomId) return;

        socket.join(roomId);
        socketToRoom.set(socket.id, roomId);

        if (!roomToSockets.has(roomId)) roomToSockets.set(roomId, new Set());
        const socketsInRoom = roomToSockets.get(roomId);

        // Notify *new* socket about existing users so it can initiate offers.
        for (const existingSocketId of socketsInRoom) {
            socket.emit('user-connected', existingSocketId);
        }

        socketsInRoom.add(socket.id);

        // Persist join activity when user is authenticated
        const socketUser = getSocketUser(socket);
        if (socketUser?.id) {
            const title = typeof payload?.title === "string" && payload.title.trim() ? payload.title.trim() : "Meeting";
            try {
                const activity = await MeetingActivity.create({
                    userId: socketUser.id,
                    username: socketUser.username,
                    meetingCode: String(roomId),
                    title,
                    joinedAt: new Date(),
                    socketId: socket.id,
                });
                socket.data.activityId = String(activity._id);
            } catch {
                // best-effort
            }
        }
    };

    const leaveRoom = async (socket) => {
        const roomId = socketToRoom.get(socket.id);
        if (!roomId) return;

        socket.leave(roomId);
        socketToRoom.delete(socket.id);

        const socketsInRoom = roomToSockets.get(roomId);
        if (socketsInRoom) {
            socketsInRoom.delete(socket.id);
            if (socketsInRoom.size === 0) {
                roomToSockets.delete(roomId);
            }
        }

        socket.to(roomId).emit('user-disconnected', socket.id);
        // Zoom-main compatibility
        socket.to(roomId).emit('user-left', socket.id);

        const activityId = socket?.data?.activityId;
        if (activityId) {
            try {
                await MeetingActivity.findByIdAndUpdate(activityId, { $set: { leftAt: new Date() } });
            } catch {
                // best-effort
            }
            socket.data.activityId = null;
        }
    };

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Your frontend (Vite/TS) events
        socket.on('join-room', (roomId, payload) => {
            joinRoom(socket, String(roomId), payload);
        });

        socket.on('offer', ({ target, offer }) => {
            if (!target || !offer) return;
            io.to(String(target)).emit('offer', { sender: socket.id, offer });
        });

        socket.on('answer', ({ target, answer }) => {
            if (!target || !answer) return;
            io.to(String(target)).emit('answer', { sender: socket.id, answer });
        });

        socket.on('ice-candidate', ({ target, candidate }) => {
            if (!target || !candidate) return;
            io.to(String(target)).emit('ice-candidate', { sender: socket.id, candidate });
        });

        // Zoom-main events (aliases)
        socket.on('join-call', (path, payload) => {
            joinRoom(socket, String(path), payload);
            // Zoom-main uses "user-joined" as the join broadcast. We'll emit for compatibility.
            const roomId = String(path);
            const socketsInRoom = roomToSockets.get(roomId) || new Set();
            io.to(roomId).emit('user-joined', socket.id, Array.from(socketsInRoom));
        });

        socket.on('signal', (toId, message) => {
            if (!toId) return;
            io.to(String(toId)).emit('signal', socket.id, message);
        });

        socket.on('chat-message', (data, sender) => {
            const roomId = socketToRoom.get(socket.id);
            if (!roomId) return;
            io.to(roomId).emit('chat-message', data, sender, socket.id);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            leaveRoom(socket);
        });
    });

    return io;
};