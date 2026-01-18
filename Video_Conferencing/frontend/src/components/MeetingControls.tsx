import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff, PhoneOff, MessageSquare, Users, VolumeX, Lock, LockOpen } from "lucide-react";
import { useLocation } from "wouter";
import type { ReactNode } from "react";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isParticipantsOpen?: boolean;
  onToggleParticipants?: () => void;
  canHostControls?: boolean;
  onMuteAll?: () => void;
  meetingLocked?: boolean;
  onToggleLock?: () => void;
  roomId: string;
  rightPanelOpen?: boolean;
}

export function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onShareScreen,
  isChatOpen,
  onToggleChat,
  isParticipantsOpen = false,
  onToggleParticipants,
  canHostControls = false,
  onMuteAll,
  meetingLocked = false,
  onToggleLock,
  rightPanelOpen = false,
}: MeetingControlsProps) {
  const [, setLocation] = useLocation();

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave the meeting?")) {
      setLocation("/");
    }
  };

  return (
    <div
      className={`fixed bottom-3 sm:bottom-8 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)] ${
        rightPanelOpen ? "sm:pr-[380px]" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-[760px]">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 bg-gray-900/90 backdrop-blur-lg px-3 sm:px-5 py-2.5 sm:py-4 rounded-2xl border border-white/10 shadow-2xl">
        <ControlButton
          onClick={onToggleMute}
          icon={isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          label={isMuted ? "Unmute" : "Mute"}
          variant={isMuted ? "danger" : "secondary"}
        />

        <ControlButton
          onClick={onToggleVideo}
          icon={isVideoOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
          label={isVideoOff ? "Start Video" : "Stop Video"}
          variant={isVideoOff ? "danger" : "secondary"}
        />

        <ControlButton
          onClick={onShareScreen}
          icon={isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />}
          label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          variant={isScreenSharing ? "active" : "secondary"}
        />

        <ControlButton
          onClick={onToggleChat}
          icon={<MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />}
          label={isChatOpen ? "Close Chat" : "Open Chat"}
          variant={isChatOpen ? "primary" : "secondary"}
        />

        {onToggleParticipants ? (
          <ControlButton
            onClick={onToggleParticipants}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            label={isParticipantsOpen ? "Close Participants" : "Participants"}
            variant={isParticipantsOpen ? "primary" : "secondary"}
          />
        ) : null}

        {canHostControls && onMuteAll ? (
          <ControlButton
            onClick={onMuteAll}
            icon={<VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Mute All"
            variant="danger"
          />
        ) : null}

        {canHostControls && onToggleLock ? (
          <ControlButton
            onClick={onToggleLock}
            icon={meetingLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <LockOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
            label={meetingLocked ? "Unlock Meeting" : "Lock Meeting"}
            variant={meetingLocked ? "active" : "secondary"}
          />
        ) : null}

        <div className="hidden sm:block w-px h-10 bg-white/10 mx-1" />

        <button
          onClick={handleLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
        </div>
      </div>
    </div>
  );
}

function ControlButton({ 
  onClick, 
  icon, 
  label, 
  variant = "secondary" 
}: { 
  onClick: () => void; 
  icon: ReactNode; 
  label: string;
  variant?: "primary" | "secondary" | "danger" | "active";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    active: "bg-green-500/20 text-green-400 border border-green-500/20",
  };

  return (
    <button
      onClick={onClick}
      className={`p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${variants[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
}
