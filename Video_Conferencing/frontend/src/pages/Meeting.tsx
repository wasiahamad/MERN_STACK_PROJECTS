import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMeeting } from "@/hooks/use-meetings";
import { useWebRTC } from "@/hooks/use-webrtc";
import { VideoGrid } from "@/components/VideoGrid";
import { MeetingControls } from "@/components/MeetingControls";
import { MeetingChat } from "@/components/MeetingChat";
import { MeetingParticipants } from "@/components/MeetingParticipants";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Meeting() {
  const [match, params] = useRoute<{ roomId: string }>("/meeting/:roomId");
  const roomId = match ? params?.roomId || "" : "";
  const [, setLocation] = useLocation();
  
  const { user, token } = useAuth();
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(roomId);
  
  const { localStream, peers, controls, chat, meeting: meetingState, socketId, participantMeta } = useWebRTC({ 
    roomId, 
    user: user || null,
    token,
    meetingTitle: meeting?.title || "Meeting",
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const canModerate = meetingState.role === "host" || meetingState.role === "cohost";
  const canHostControls = meetingState.role === "host";

  useEffect(() => {
    if (!meetingState.joinDeniedReason) return;
    // If removed or denied, send user back home.
    setTimeout(() => setLocation("/"), 300);
  }, [meetingState.joinDeniedReason, setLocation]);

  const participantItems = useMemo(() => {
    const list: Array<{ socketId: string; label: string; userId?: string; username?: string; role?: string; devices?: number }> = [];
    const roles = meetingState.roles;

    const getRoleByUserId = (userId: string) => {
      if (!roles?.participants || !userId) return "participant";
      const uid = String(userId);
      const hostId = roles?.hostId ? String(roles.hostId) : "";
      if (hostId && hostId === uid) return "host";
      const coHosts = Array.isArray(roles?.coHosts) ? roles.coHosts.map((x) => String(x)) : [];
      if (coHosts.includes(uid)) return "cohost";
      const row = roles.participants.find((r: { userId: string; role: string }) => String(r.userId) === String(userId));
      return row?.role || "participant";
    };

    const connectedSocketIds = new Set<string>();
    if (socketId) connectedSocketIds.add(String(socketId));
    for (const p of peers) {
      if (p?.userId) connectedSocketIds.add(String(p.userId));
    }

    // Group by real userId when available to avoid duplicates on reconnect/multiple tabs.
    const byUserId = new Map<
      string,
      { userId: string; username: string; socketIds: string[]; bestSocketId: string }
    >();

    const upsert = (sid: string, fallbackLabel: string) => {
      const meta = participantMeta?.[sid];
      const uid = meta?.userId ? String(meta.userId) : "";
      const uname = meta?.username ? String(meta.username) : "";

      // If no authenticated meta, treat as unique socket participant.
      if (!uid) {
        list.push({
          socketId: sid,
          label: fallbackLabel,
          role: "participant",
        });
        return;
      }

      const existing = byUserId.get(uid);
      if (!existing) {
        byUserId.set(uid, {
          userId: uid,
          username: uname,
          socketIds: [sid],
          bestSocketId: sid,
        });
        return;
      }

      if (!existing.socketIds.includes(sid)) existing.socketIds.push(sid);
      if (!existing.username && uname) existing.username = uname;
      // Prefer a socket that is actually connected (RTC peer or self)
      if (connectedSocketIds.has(sid)) existing.bestSocketId = sid;
    };

    // Seed from participantMeta so we see everyone in the room.
    if (participantMeta) {
      for (const sid of Object.keys(participantMeta)) {
        upsert(String(sid), `User ${String(sid).slice(0, 6)}`);
      }
    }

    // Ensure self + RTC peers exist even if meta is missing.
    if (socketId) upsert(String(socketId), "You");
    for (const p of peers) {
      if (!p?.userId) continue;
      upsert(String(p.userId), `User ${String(p.userId).slice(0, 6)}`);
    }

    // Convert grouped users to display list
    for (const row of byUserId.values()) {
      const role = row.userId ? getRoleByUserId(row.userId) : "participant";
      const isSelf = row.bestSocketId && socketId && String(row.bestSocketId) === String(socketId);
      const label = isSelf ? "You" : row.username || `User ${row.userId.slice(0, 6)}`;
      list.push({
        socketId: row.bestSocketId,
        label,
        username: row.username || undefined,
        userId: row.userId,
        role,
        devices: row.socketIds.length,
      });
    }

    // Final de-dup by socketId (safety)
    const seen = new Set<string>();
    return list.filter((x) => {
      const sid = String(x.socketId);
      if (seen.has(sid)) return false;
      seen.add(sid);
      return true;
    });
  }, [meetingState.roles, participantMeta, peers, socketId]);

  const getApiBaseUrl = () => (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

  const toggleLock = async () => {
    if (!token) return;
    const meetingId = meeting?.id;
    if (!meetingId) return;
    const endpoint = meetingState.locked ? "unlock" : "lock";
    await fetch(`${getApiBaseUrl()}/api/meetings/${encodeURIComponent(String(meetingId))}/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  };

  const toggleCohost = async (userId: string, action: "assign" | "remove") => {
    if (!token) return;
    const meetingId = meeting?.id;
    if (!meetingId) return;
    await fetch(`${getApiBaseUrl()}/api/meetings/${encodeURIComponent(String(meetingId))}/assign-cohost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, action }),
    }).catch(() => null);
  };

  if (isMeetingLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <h1 className="text-2xl font-bold">Meeting not found</h1>
        <p className="text-muted-foreground">The meeting ID you entered does not exist.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-white font-display text-lg font-semibold flex items-center gap-3">
            {meeting.title}
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 font-mono">
              {roomId}
            </span>
          </h2>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 overflow-hidden pt-16 pb-24 px-4">
        <VideoGrid localStream={localStream} peers={peers} />
        
        {peers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Waiting for others...</h3>
              <p className="text-gray-400">Share the Room ID: <span className="text-primary font-mono select-all pointer-events-auto cursor-copy font-bold">{roomId}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        isMuted={controls.isMuted}
        isVideoOff={controls.isVideoOff}
        isScreenSharing={controls.isScreenSharing}
        onToggleMute={controls.toggleMute}
        onToggleVideo={controls.toggleVideo}
        onShareScreen={controls.shareScreen}
        isChatOpen={chatOpen}
        onToggleChat={() => setChatOpen((v) => !v)}
        isParticipantsOpen={participantsOpen}
        onToggleParticipants={() => setParticipantsOpen((v) => !v)}
        canHostControls={Boolean(token) && canHostControls}
        onMuteAll={() => controls.muteAll?.()}
        meetingLocked={meetingState.locked}
        onToggleLock={Boolean(token) && canHostControls ? toggleLock : undefined}
        roomId={roomId}
      />

      <MeetingParticipants
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        peers={participantItems}
        selfSocketId={socketId}
        canModerate={Boolean(token) && canModerate}
        canHost={Boolean(token) && canHostControls}
        onRequestMute={(id: string) => controls.requestMute?.(id)}
        onKick={(id: string) => controls.kickParticipant?.(id)}
        onToggleCohost={toggleCohost}
      />

      <MeetingChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chat.messages}
        onSend={chat.sendMessage}
      />

      {meetingState.joinDeniedReason ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center max-w-md">
            <div className="text-white font-semibold text-lg">You can’t join this meeting</div>
            <div className="text-sm text-gray-300 mt-2">Reason: {meetingState.joinDeniedReason}</div>
            <div className="text-xs text-gray-400 mt-3">Redirecting…</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
