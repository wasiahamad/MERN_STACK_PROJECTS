import { useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMeeting } from "@/hooks/use-meetings";
import { useWebRTC } from "@/hooks/use-webrtc";
import { VideoGrid } from "@/components/VideoGrid";
import { MeetingControls } from "@/components/MeetingControls";
import { MeetingChat } from "@/components/MeetingChat";
import { Loader2 } from "lucide-react";

export default function Meeting() {
  const [, params] = useRoute("/meeting/:roomId");
  const roomId = params?.roomId || "";
  
  const { user, token } = useAuth();
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(roomId);
  
  const { localStream, peers, controls, chat } = useWebRTC({ 
    roomId, 
    user: user || null,
    token,
    meetingTitle: meeting?.title || "Meeting",
  });

  const [chatOpen, setChatOpen] = useState(false);

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
        roomId={roomId}
      />

      <MeetingChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chat.messages}
        onSend={chat.sendMessage}
      />
    </div>
  );
}
