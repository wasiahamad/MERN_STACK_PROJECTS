import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import type { User } from "./use-auth";
import { toast } from "@/hooks/use-toast";

type MeetingRole = "host" | "cohost" | "participant" | "none";

type MeetingRolesSnapshot = {
  meetingId: string;
  roomId: string;
  locked: boolean;
  hostId: string;
  coHosts: string[];
  participants: Array<{ userId: string; role: Exclude<MeetingRole, "none"> }>;
};

type ParticipantMeta = Record<string, { userId: string; username: string; name?: string; avatarUrl?: string }>;
type ParticipantMetaRow = { socketId: string; userId: string; username: string; name?: string; avatarUrl?: string };

type VideoStateMap = Record<string, boolean>; // socketId -> videoEnabled

interface Peer {
  userId: string;
  stream?: MediaStream;
  connection: RTCPeerConnection;
}

interface UseWebRTCProps {
  roomId: string;
  user: User | null;
  token?: string | null;
  meetingTitle?: string;
}

function buildIceServers(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL as string | undefined;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined;
  if (turnUrl && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return { iceServers };
}

export function useWebRTC({ roomId, user, token, meetingTitle }: UseWebRTCProps) {
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [myRole, setMyRole] = useState<MeetingRole>("participant");
  const [rolesSnapshot, setRolesSnapshot] = useState<MeetingRolesSnapshot | null>(null);
  const [joinDeniedReason, setJoinDeniedReason] = useState<string | null>(null);
  const [participantMeta, setParticipantMeta] = useState<ParticipantMeta>({});
  const [videoState, setVideoState] = useState<VideoStateMap>({});
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: string; text: string; at: string; isSelf: boolean }>
  >([]);

  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "reconnecting" | "error"
  >("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, Peer>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const joinRequestedRef = useRef(false);
  const joinedRef = useRef(false);
  const pendingOfferTargetsRef = useRef<Set<string>>(new Set());

  const setAudioEnabled = useCallback(
    (enabled: boolean) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      stream.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
      setIsMuted(!enabled);
    },
    [setIsMuted]
  );

  // Initialize Socket and Media
  useEffect(() => {
    if (!user || !roomId) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";

    // Connect to Socket.IO (assuming server is on same host)
    setConnectionStatus("connecting");
    setConnectionError(null);

    joinRequestedRef.current = false;
    joinedRef.current = false;
    pendingOfferTargetsRef.current = new Set();

    socketRef.current = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      query: {
        roomId,
        userId: user.id.toString(),
        username: user.username || "",
        name: user.name || "",
        avatarUrl: user.avatarUrl || "",
      },
      auth: token ? { token } : undefined,
    });

    const socket = socketRef.current;

    const onConnect = () => {
      setConnectionStatus("connected");
      setConnectionError(null);

      // If media is ready and we previously intended to join, join now.
      if (joinRequestedRef.current && !joinedRef.current && localStreamRef.current) {
        joinedRef.current = true;
        socket.emit("join-room", roomId, { title: meetingTitle || "Meeting" });
      }
    };

    const onDisconnect = (reason: string) => {
      // socket.io disconnect reasons can be 'transport close', 'io server disconnect', etc.
      setConnectionStatus("reconnecting");
      setConnectionError(reason || "disconnected");
    };

    const onConnectError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err ?? "connect_error");
      setConnectionStatus("error");
      setConnectionError(message);
      toast({
        title: "Connection issue",
        description: `Unable to connect to meeting server. ${message}`,
        variant: "destructive",
      });
    };

    const onReconnectAttempt = () => {
      setConnectionStatus("reconnecting");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    const onOffline = () => {
      toast({
        title: "Network offline",
        description: "You are offline. Please check your internet connection.",
        variant: "destructive",
      });
    };

    const onOnline = () => {
      toast({
        title: "Back online",
        description: "Internet connection restored.",
      });
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
        localStreamRef.current = stream;

        // Only join once we have media; if socket is already connected, join immediately.
        joinRequestedRef.current = true;
        if (socket.connected && !joinedRef.current) {
          joinedRef.current = true;
          socket.emit("join-room", roomId, { title: meetingTitle || "Meeting" });
        }

        // Flush any offer targets we saw before media was ready.
        const pending = Array.from(pendingOfferTargetsRef.current);
        pendingOfferTargetsRef.current.clear();
        for (const sid of pending) {
          socket.emit("__flush-offer__", sid); // no-op marker (server ignores)
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast({
          title: "Camera/Mic blocked",
          description: "Please allow camera/microphone permissions and retry.",
          variant: "destructive",
        });
      }
    };

    initMedia();

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);

      try {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("connect_error", onConnectError);
        socket.io.off("reconnect_attempt", onReconnectAttempt);
      } catch {
        // ignore
      }

      localStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(p => p.connection.close());
      socketRef.current?.disconnect();
    };
  }, [roomId, user, token, meetingTitle]);

  const createPeer = useCallback((targetUserId: string, initiator: boolean, stream: MediaStream) => {
    const connection = new RTCPeerConnection(buildIceServers());

    // Add local tracks to connection
    stream.getTracks().forEach(track => {
      connection.addTrack(track, stream);
    });

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          target: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming stream
    connection.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [targetUserId]: { ...prev[targetUserId], stream: event.streams[0] }
      }));
    };

    // Help users on poor networks (no TURN / strict NAT)
    connection.oniceconnectionstatechange = () => {
      const st = connection.iceConnectionState;
      if (st === "failed") {
        toast({
          title: "Connection issue",
          description:
            "WebRTC ICE failed. This usually needs a TURN server on strict networks/hotspots.",
          variant: "destructive",
        });
        try {
          connection.restartIce();
        } catch {
          // ignore
        }
      }
    };

    const peer: Peer = { userId: targetUserId, connection, stream: undefined };
    peersRef.current[targetUserId] = peer;
    setPeers(prev => ({ ...prev, [targetUserId]: peer }));

    return connection;
  }, []);

  // Handle Socket Events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const ensureOfferTo = async (targetSocketId: string) => {
      const target = String(targetSocketId || "");
      if (!target) return;
      if (!localStreamRef.current) return;
      if (target === socket.id) return;
      if (peersRef.current[target]) return;

      const connection = createPeer(target, true, localStreamRef.current);
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.emit("offer", { target, offer });
    };

    socket.on("user-connected", async (socketId: string) => {
      // Server sends existing socketIds to the joiner; joiner initiates offers.
      // If media isn't ready yet, queue the target so we don't miss the window.
      if (!localStreamRef.current) {
        pendingOfferTargetsRef.current.add(String(socketId));
        return;
      }
      await ensureOfferTo(socketId);
    });

    // After media becomes ready, flush any queued offer targets.
    const flushQueuedOffers = async () => {
      if (!localStreamRef.current) return;
      const pending = Array.from(pendingOfferTargetsRef.current);
      pendingOfferTargetsRef.current.clear();
      for (const sid of pending) {
        await ensureOfferTo(sid);
      }
    };

    // Poll a couple times right after join to avoid race conditions on slower devices.
    const t1 = window.setTimeout(flushQueuedOffers, 250);
    const t2 = window.setTimeout(flushQueuedOffers, 1000);

    socket.on("offer", async ({ sender, offer }) => {
      if (!localStreamRef.current) return;
      const connection = peersRef.current[String(sender)]?.connection || createPeer(sender, false, localStreamRef.current);
      
      await connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      
      socket.emit("answer", { target: sender, answer });
    });

    socket.on("answer", async ({ sender, answer }) => {
      const peer = peersRef.current[sender];
      if (peer) {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ sender, candidate }) => {
      const peer = peersRef.current[sender];
      if (peer) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("user-disconnected", (userId: string) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].connection.close();
        const newPeers = { ...peersRef.current };
        delete newPeers[userId];
        peersRef.current = newPeers;
        setPeers(newPeers);
      }

      setParticipantMeta((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    // Additive: participant identity metadata for UI (maps socketId -> userId/username)
    socket.on("participants-meta", (rows: Array<ParticipantMetaRow>) => {
      if (!Array.isArray(rows)) return;
      setParticipantMeta((prev) => {
        const next = { ...prev };
        for (const r of rows) {
          if (!r?.socketId) continue;
          next[String(r.socketId)] = {
            userId: String(r.userId || ""),
            username: String(r.username || ""),
            name: typeof r.name === "string" ? r.name : undefined,
            avatarUrl: typeof r.avatarUrl === "string" ? r.avatarUrl : undefined,
          };
        }
        return next;
      });
    });

    socket.on("participant-meta", (row: ParticipantMetaRow) => {
      if (!row?.socketId) return;
      setParticipantMeta((prev) => ({
        ...prev,
        [String(row.socketId)]: {
          userId: String(row.userId || ""),
          username: String(row.username || ""),
          name: typeof row.name === "string" ? row.name : undefined,
          avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : undefined,
        },
      }));
    });

    socket.on("participant-meta-removed", (row: { socketId: string }) => {
      const sid = row?.socketId ? String(row.socketId) : "";
      if (!sid) return;
      setParticipantMeta((prev) => {
        if (!prev[sid]) return prev;
        const next = { ...prev };
        delete next[sid];
        return next;
      });

      setVideoState((prev) => {
        if (!prev[sid] && prev[sid] !== false) return prev;
        const next = { ...prev };
        delete next[sid];
        return next;
      });
    });

    // Broadcasted when someone toggles camera
    socket.on("video-state", (payload: { socketId?: string; videoEnabled?: boolean }) => {
      const sid = payload?.socketId ? String(payload.socketId) : "";
      if (!sid) return;
      setVideoState((prev) => ({ ...prev, [sid]: Boolean(payload.videoEnabled) }));
    });

    socket.on("chat-message", (data: string, sender: string, senderSocketId?: string) => {
      const text = typeof data === "string" ? data : String(data ?? "");
      const name = typeof sender === "string" ? sender : "Unknown";
      const isSelf = senderSocketId ? senderSocketId === socket.id : name === (user?.username || "");
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          sender: name,
          text,
          at: new Date().toISOString(),
          isSelf,
        },
      ]);
    });

    // Additive: meeting lock + role sync (no impact on WebRTC signaling)
    socket.on("meeting-lock-state", (payload: { roomId?: string; locked?: boolean }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      setMeetingLocked(Boolean(payload?.locked));
    });

    socket.on("meeting-locked", (payload: { roomId?: string; locked?: boolean }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      setMeetingLocked(true);
    });

    socket.on("meeting-unlocked", (payload: { roomId?: string; locked?: boolean }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      setMeetingLocked(false);
    });

    socket.on("meeting-role", (payload: { roomId?: string; role?: MeetingRole }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      const role = payload?.role;
      if (role === "host" || role === "cohost" || role === "participant" || role === "none") {
        setMyRole(role);
      }
    });

    socket.on("meeting-roles-updated", (snapshot: MeetingRolesSnapshot) => {
      if (!snapshot?.roomId) return;
      if (String(snapshot.roomId) !== roomId) return;
      setRolesSnapshot(snapshot);
      setMeetingLocked(Boolean(snapshot.locked));
    });

    socket.on("join-denied", (payload: { roomId?: string; reason?: string }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      setJoinDeniedReason(String(payload?.reason || "unknown"));
    });

    socket.on("meeting-mute-all", (payload: { roomId?: string }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      // best-effort: locally mute
      setAudioEnabled(false);
    });

    socket.on("meeting-mute", (payload: { roomId?: string }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      setAudioEnabled(false);
    });

    socket.on("meeting-kicked", (payload: { roomId?: string; reason?: string; by?: string }) => {
      if (payload?.roomId && String(payload.roomId) !== roomId) return;
      // Stop media + disconnect; Meeting page can redirect based on this state.
      setJoinDeniedReason(payload?.reason ? `kicked:${payload.reason}` : "kicked");
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      try {
        Object.values(peersRef.current).forEach((p) => p.connection.close());
      } catch {
        // ignore
      }
      try {
        socket.disconnect();
      } catch {
        // ignore
      }
    });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      socket.off("participants-meta");
      socket.off("participant-meta");
      socket.off("participant-meta-removed");
      socket.off("video-state");
      socket.off("chat-message");
      socket.off("meeting-lock-state");
      socket.off("meeting-locked");
      socket.off("meeting-unlocked");
      socket.off("meeting-role");
      socket.off("meeting-roles-updated");
      socket.off("join-denied");
      socket.off("meeting-mute-all");
      socket.off("meeting-mute");
      socket.off("meeting-kicked");
    };
  }, [createPeer, roomId, setAudioEnabled]);

  const sendChatMessage = useCallback(
    (text: string) => {
      const cleaned = String(text || "").trim();
      if (!cleaned) return;
      const senderName = user?.username || "You";
      socketRef.current?.emit("chat-message", cleaned, senderName);
    },
    [user]
  );

  // Controls
  const toggleMute = () => {
    if (localStream) {
      const nextEnabled = isMuted; // if currently muted, enable; else disable
      setAudioEnabled(nextEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const tracks = localStream.getVideoTracks();
      const currentlyEnabled = tracks.some((t) => t.enabled);
      const nextEnabled = !currentlyEnabled;
      tracks.forEach((t) => {
        t.enabled = nextEnabled;
      });
      setIsVideoOff(!nextEnabled);

      const sid = socketRef.current?.id;
      if (sid) {
        setVideoState((prev) => ({ ...prev, [String(sid)]: Boolean(nextEnabled) }));
        socketRef.current?.emit("video-state", { videoEnabled: Boolean(nextEnabled) });
      }
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      // Stop screen share - revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.connection.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
      });
      
      setLocalStream(stream);
      setIsScreenSharing(false);
    } else {
      // Start screen share
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.connection.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => shareScreen(); // Handle browser "Stop sharing" button
        
        setLocalStream(prev => {
          if (!prev) return stream;
          // Keep audio from original stream
          const newStream = new MediaStream([screenTrack, ...prev.getAudioTracks()]);
          return newStream;
        });
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Failed to share screen", err);
      }
    }
  };

  return {
    localStream,
    peers: Object.values(peers),
    socketId: socketRef.current?.id || null,
    participantMeta,
    videoState,
    connection: {
      status: connectionStatus,
      error: connectionError,
    },
    meeting: {
      locked: meetingLocked,
      role: myRole,
      roles: rolesSnapshot,
      joinDeniedReason,
    },
    controls: {
      isMuted,
      isVideoOff,
      isScreenSharing,
      toggleMute,
      toggleVideo,
      shareScreen,
      muteAll: () => socketRef.current?.emit("host-mute-all"),
      requestMute: (targetSocketId: string) => socketRef.current?.emit("request-mute", targetSocketId),
      kickParticipant: (targetSocketId: string) => socketRef.current?.emit("kick-participant", targetSocketId),
    },
    chat: {
      messages: chatMessages,
      sendMessage: sendChatMessage,
    },
  };
}
