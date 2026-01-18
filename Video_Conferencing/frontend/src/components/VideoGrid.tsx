import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, VideoOff } from "lucide-react";

interface VideoGridProps {
  localStream: MediaStream | null;
  peers: Array<{ userId: string; stream?: MediaStream }>;
}

export function VideoGrid({ localStream, peers }: VideoGridProps) {
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
        label="You" 
      />

      {/* Remote Peers */}
      <AnimatePresence>
        {peers.map((peer) => (
          <VideoTile
            key={peer.userId}
            stream={peer.stream || null}
            label={`User ${peer.userId}`}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function VideoTile({ stream, isLocal = false, label }: { stream: MediaStream | null; isLocal?: boolean; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl group"
    >
      {stream ? (
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
            <div className="p-4 bg-gray-700/50 rounded-full">
              <User className="w-12 h-12" />
            </div>
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        </div>
      )}

      {/* Overlay Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white text-sm font-medium flex items-center gap-2">
          {isLocal && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          {label}
        </div>
        
        {!stream?.getVideoTracks()[0]?.enabled && (
          <div className="p-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-500">
            <VideoOff className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
