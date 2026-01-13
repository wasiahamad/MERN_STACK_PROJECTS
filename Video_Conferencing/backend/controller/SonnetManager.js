import { Server } from 'socket.io';

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

    const joinRoom = (socket, roomId) => {
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
    };

    const leaveRoom = (socket) => {
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
    };

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Your frontend (Vite/TS) events
        socket.on('join-room', (roomId) => {
            joinRoom(socket, String(roomId));
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
        socket.on('join-call', (path) => {
            joinRoom(socket, String(path));
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