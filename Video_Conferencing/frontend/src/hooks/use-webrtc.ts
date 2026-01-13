import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import type { User } from "./use-auth";

interface Peer {
  userId: string;
  stream?: MediaStream;
  connection: RTCPeerConnection;
}

interface UseWebRTCProps {
  roomId: string;
  user: User | null;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC({ roomId, user }: UseWebRTCProps) {
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: string; text: string; at: string; isSelf: boolean }>
  >([]);
  
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, Peer>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize Socket and Media
  useEffect(() => {
    if (!user || !roomId) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    // Connect to Socket.IO (assuming server is on same host)
    socketRef.current = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      query: { roomId, userId: user.id.toString() },
    });

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        
        socketRef.current?.emit("join-room", roomId, user.id);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(p => p.connection.close());
      socketRef.current?.disconnect();
    };
  }, [roomId, user]);

  const createPeer = useCallback((targetUserId: string, initiator: boolean, stream: MediaStream) => {
    const connection = new RTCPeerConnection(ICE_SERVERS);

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

    const peer: Peer = { userId: targetUserId, connection, stream: undefined };
    peersRef.current[targetUserId] = peer;
    setPeers(prev => ({ ...prev, [targetUserId]: peer }));

    return connection;
  }, []);

  // Handle Socket Events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("user-connected", async (userId: string) => {
      if (!localStreamRef.current) return;
      const connection = createPeer(userId, true, localStreamRef.current);
      
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      
      socket.emit("offer", { target: userId, offer });
    });

    socket.on("offer", async ({ sender, offer }) => {
      if (!localStreamRef.current) return;
      const connection = createPeer(sender, false, localStreamRef.current);
      
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

    return () => {
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      socket.off("chat-message");
    };
  }, [createPeer]);

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
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
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
    controls: {
      isMuted,
      isVideoOff,
      isScreenSharing,
      toggleMute,
      toggleVideo,
      shareScreen
    },
    chat: {
      messages: chatMessages,
      sendMessage: sendChatMessage,
    },
  };
}
