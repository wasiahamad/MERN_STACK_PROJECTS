import { Server } from 'socket.io';
import jwt from "jsonwebtoken";
import Meeting from "../model/Meeting.model.js";

let ioRef = null;

export const getIO = () => ioRef;

function toIdString(value) {
    if (!value) return "";
    return typeof value === "string" ? value : String(value);
}

function hasUserId(list, userId) {
    const id = toIdString(userId);
    if (!id || !Array.isArray(list)) return false;
    return list.some((v) => toIdString(v) === id);
}

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
        },
    });

    ioRef = io;

    // --- Room state (supports both your current frontend events + Zoom-main events) ---
    const roomToSockets = new Map(); // roomId -> Set<socketId>
    const socketToRoom = new Map(); // socketId -> roomId
    const roomToParticipantMeta = new Map(); // roomId -> Map<socketId, { userId, username }>

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

    const readRoomIdForSocket = (socket) => {
        const rid = socketToRoom.get(socket.id);
        return rid ? String(rid) : "";
    };

    const findMeetingByRoomId = async (roomId) => {
        if (!roomId) return null;
        try {
            return await Meeting.findOne({ meetingCode: String(roomId) });
        } catch {
            return null;
        }
    };

    const requireMeetingRole = async (socket, allowedRoles) => {
        const roomId = readRoomIdForSocket(socket);
        if (!roomId) return { ok: false, roomId: "", meeting: null, role: "none", user: null };

        const user = socket?.data?.user || getSocketUser(socket);
        if (!user?.id) return { ok: false, roomId, meeting: null, role: "none", user: null };

        const meeting = await findMeetingByRoomId(roomId);
        if (!meeting) return { ok: false, roomId, meeting: null, role: "none", user };

        const role = computeMeetingRole(meeting, user);
        const ok = Array.isArray(allowedRoles) ? allowedRoles.includes(role) : false;
        return { ok, roomId, meeting, role, user };
    };

    const computeMeetingRole = (meeting, socketUser) => {
        if (!meeting || !socketUser?.id) return "none";
        const hostId = toIdString(meeting.hostId || meeting.user_id);
        if (hostId && hostId === toIdString(socketUser.id)) return "host";
        if (hasUserId(meeting.coHosts, socketUser.id)) return "cohost";
        return "participant";
    };

    const serializeRoles = (meeting) => {
        const participants = Array.isArray(meeting.participants)
            ? meeting.participants.map((p) => ({
                userId: toIdString(p.userId),
                role: String(p.role || "participant"),
            }))
            : [];

        return {
            meetingId: toIdString(meeting._id),
            roomId: toIdString(meeting.meetingCode),
            locked: Boolean(meeting.locked),
            hostId: toIdString(meeting.hostId || meeting.user_id),
            coHosts: Array.isArray(meeting.coHosts) ? meeting.coHosts.map((id) => toIdString(id)) : [],
            participants,
        };
    };

    const joinRoom = async (socket, roomId, payload) => {
        if (!roomId) return;

        const socketUser = socket?.data?.user || getSocketUser(socket);

        // If this room maps to a persisted meeting, enforce lock + roles.
        let meeting = null;
        try {
            meeting = await Meeting.findOne({ meetingCode: String(roomId) });
        } catch {
            meeting = null;
        }

        if (meeting) {
            const role = computeMeetingRole(meeting, socketUser);
            const isKnownParticipant = socketUser?.id
                ? Array.isArray(meeting.participants) && meeting.participants.some((p) => toIdString(p?.userId) === toIdString(socketUser.id))
                : false;

            if (meeting.locked) {
                const canBypassLock = role === "host" || role === "cohost" || isKnownParticipant;
                if (!canBypassLock) {
                    socket.emit("join-denied", { roomId: String(roomId), reason: "locked" });
                    socket.emit("meeting-locked", { roomId: String(roomId), locked: true });
                    return;
                }
            }

            // Best-effort migration for older meetings
            if (!meeting.hostId) meeting.hostId = meeting.user_id;

            // Sync participant role metadata on join
            if (socketUser?.id) {
                const now = new Date();
                if (!Array.isArray(meeting.participants)) meeting.participants = [];

                const idx = meeting.participants.findIndex((p) => toIdString(p?.userId) === toIdString(socketUser.id));
                if (idx >= 0) {
                    meeting.participants[idx].role = role;
                    meeting.participants[idx].lastJoinedAt = now;
                    meeting.participants[idx].lastLeftAt = null;
                } else {
                    meeting.participants.push({
                        userId: socketUser.id,
                        role,
                        joinedAt: now,
                        lastJoinedAt: now,
                        lastLeftAt: null,
                    });
                }

                try {
                    await meeting.save();
                } catch {
                    // best-effort
                }
            }

            socket.emit("meeting-lock-state", { roomId: String(roomId), locked: Boolean(meeting.locked) });
            if (socketUser?.id) {
                socket.emit("meeting-role", { roomId: String(roomId), role: computeMeetingRole(meeting, socketUser) });
            }
            io.to(String(roomId)).emit("meeting-roles-updated", serializeRoles(meeting));
        }

        socket.join(roomId);
        socketToRoom.set(socket.id, roomId);

        if (!roomToSockets.has(roomId)) roomToSockets.set(roomId, new Set());
        const socketsInRoom = roomToSockets.get(roomId);

        if (!roomToParticipantMeta.has(roomId)) roomToParticipantMeta.set(roomId, new Map());
        const metaInRoom = roomToParticipantMeta.get(roomId);

        // If the same authenticated user joins again, drop old sockets to avoid duplicates.
        // This fixes cases where reconnect/refresh leaves a ghost entry.
        if (socketUser?.id) {
            const uid = String(socketUser.id);
            const duplicates = Array.from(metaInRoom.entries())
                .filter(([sid, meta]) => sid !== socket.id && String(meta?.userId || "") === uid)
                .map(([sid]) => sid);

            for (const sid of duplicates) {
                try {
                    metaInRoom.delete(sid);
                    io.to(String(roomId)).emit('participant-meta-removed', { socketId: sid });
                } catch {
                    // ignore
                }

                try {
                    const oldSocket = io.sockets.sockets.get(String(sid));
                    if (oldSocket) oldSocket.disconnect(true);
                } catch {
                    // ignore
                }
            }
        }

        // Send existing participant metadata to the new joiner (additive)
        try {
            socket.emit(
                'participants-meta',
                Array.from(metaInRoom.entries()).map(([socketId, meta]) => ({ socketId, ...meta }))
            );
        } catch {
            // ignore
        }

        // Notify *new* socket about existing users so it can initiate offers.
        for (const existingSocketId of socketsInRoom) {
            socket.emit('user-connected', existingSocketId);
        }

        socketsInRoom.add(socket.id);

        // Broadcast participant metadata (socketId -> userId/username) to the room
        if (socketUser?.id) {
            const meta = { userId: String(socketUser.id), username: String(socketUser.username || "") };
            metaInRoom.set(socket.id, meta);
            io.to(String(roomId)).emit('participant-meta', { socketId: socket.id, ...meta });
        }

        // MeetingActivity removed (no history tracking)
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

        const metaInRoom = roomToParticipantMeta.get(roomId);
        if (metaInRoom) {
            metaInRoom.delete(socket.id);
            io.to(String(roomId)).emit('participant-meta-removed', { socketId: socket.id });
            if (metaInRoom.size === 0) roomToParticipantMeta.delete(roomId);
        }

        socket.to(roomId).emit('user-disconnected', socket.id);
        // Zoom-main compatibility
        socket.to(roomId).emit('user-left', socket.id);

        // MeetingActivity removed (no history tracking)

        // Best-effort update of meeting participant lastLeftAt
        const socketUser = socket?.data?.user || getSocketUser(socket);
        if (socketUser?.id) {
            try {
                await Meeting.updateOne(
                    { meetingCode: String(roomId), "participants.userId": socketUser.id },
                    { $set: { "participants.$.lastLeftAt": new Date() } }
                );
            } catch {
                // best-effort
            }
        }
    };

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // cache decoded user for later joins/leaves
        socket.data.user = getSocketUser(socket);

        // Your frontend (Vite/TS) events
        socket.on('join-room', async (roomId, payload) => {
            await joinRoom(socket, String(roomId), payload);
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
        socket.on('join-call', async (path, payload) => {
            await joinRoom(socket, String(path), payload);
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

        // --- Moderation controls (additive) ---
        // Host: mute all
        socket.on('host-mute-all', async () => {
            const ctx = await requireMeetingRole(socket, ["host"]);
            if (!ctx.ok) return;
            io.to(ctx.roomId).emit('meeting-mute-all', {
                roomId: ctx.roomId,
                by: ctx.user?.username || "host",
                at: new Date().toISOString(),
            });
        });

        // Host/Co-host: request a specific participant to mute (best-effort)
        socket.on('request-mute', async (targetSocketId) => {
            const ctx = await requireMeetingRole(socket, ["host", "cohost"]);
            if (!ctx.ok) return;
            const targetId = typeof targetSocketId === "string" ? targetSocketId.trim() : "";
            if (!targetId) return;
            const targetSocket = io.sockets.sockets.get(targetId);
            if (!targetSocket) return;
            if (readRoomIdForSocket(targetSocket) !== ctx.roomId) return;

            io.to(targetId).emit('meeting-mute', {
                roomId: ctx.roomId,
                by: ctx.user?.username || ctx.role,
                at: new Date().toISOString(),
            });
        });

        // Host/Co-host: remove participant (kick)
        socket.on('kick-participant', async (targetSocketId) => {
            const ctx = await requireMeetingRole(socket, ["host", "cohost"]);
            if (!ctx.ok) return;
            const targetId = typeof targetSocketId === "string" ? targetSocketId.trim() : "";
            if (!targetId) return;
            const targetSocket = io.sockets.sockets.get(targetId);
            if (!targetSocket) return;
            if (readRoomIdForSocket(targetSocket) !== ctx.roomId) return;

            io.to(targetId).emit('meeting-kicked', {
                roomId: ctx.roomId,
                by: ctx.user?.username || ctx.role,
                at: new Date().toISOString(),
                reason: "removed",
            });

            try {
                targetSocket.disconnect(true);
            } catch {
                // best-effort
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            leaveRoom(socket);
        });
    });

    return io;
};