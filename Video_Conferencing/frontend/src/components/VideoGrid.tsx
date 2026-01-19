import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, VideoOff } from "lucide-react";

interface VideoGridProps {
  localStream: MediaStream | null;
  peers: Array<{ userId: string; stream?: MediaStream; label?: string; avatarUrl?: string; forceCameraOff?: boolean }>;
  localLabel?: string;
  localAvatarUrl?: string;
}

export function VideoGrid({ localStream, peers, localLabel = "You", localAvatarUrl }: VideoGridProps) {
  const gridLayoutClass = peers.length === 0 
    ? "grid-cols-1" 
    : peers.length === 1 
      ? "grid-cols-1 md:grid-cols-2" 
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridLayoutClass} gap-2 sm:gap-4 p-2 sm:p-4 h-full max-h-screen overflow-y-auto`}>
      {/* Local Video */}
      <VideoTile 
        stream={localStream} 
        isLocal 
        label={localLabel}
        avatarUrl={localAvatarUrl}
      />

      {/* Remote Peers */}
      <AnimatePresence>
        {peers.map((peer) => (
          <VideoTile
            key={peer.userId}
            stream={peer.stream || null}
            label={peer.label || `User ${peer.userId}`}
            avatarUrl={peer.avatarUrl}
            forceCameraOff={peer.forceCameraOff}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function VideoTile({
  stream,
  isLocal = false,
  label,
  avatarUrl,
  forceCameraOff,
}: {
  stream: MediaStream | null;
  isLocal?: boolean;
  label: string;
  avatarUrl?: string;
  forceCameraOff?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoTrack = stream?.getVideoTracks?.()?.[0];
  const hasVideo = Boolean(videoTrack);
  const videoEnabled = Boolean(videoTrack?.enabled);
  const shouldShowVideo = Boolean(stream && hasVideo && videoEnabled && !forceCameraOff);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!stream) return;
    // Important: when camera is toggled off -> on, the <video> element remounts
    // but `stream` doesn't change, so we must re-attach srcObject when shown.
    if (shouldShowVideo) {
      el.srcObject = stream;
      const p = el.play?.();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch(() => {
          // Autoplay can be blocked on some mobile browsers.
        });
      }
    }
  }, [stream, shouldShowVideo]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl group"
    >
      {shouldShowVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            {avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 shadow-lg">
                <img src={avatarUrl} alt={label} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-4 bg-gray-700/50 rounded-full">
                <User className="w-12 h-12" />
              </div>
            )}
            <span className="text-sm font-medium">
              {stream ? "Camera Off" : "Connecting..."}
            </span>
          </div>
        </div>
      )}

      {/* Overlay Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white text-sm font-medium flex items-center gap-2">
          {isLocal && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          {label}
        </div>
        
        {stream && hasVideo && !videoEnabled && (
          <div className="p-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-500">
            <VideoOff className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
