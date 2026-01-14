import { useEffect, useMemo, useRef, useState } from "react";
import { X, User2, Shield, Crown, MicOff, UserMinus, UserPlus, UserX } from "lucide-react";

export function MeetingParticipants({
  open,
  onClose,
  peers,
  selfSocketId,
  canModerate,
  canHost,
  onRequestMute,
  onKick,
  onToggleCohost,
}: {
  open: boolean;
  onClose: () => void;
  peers: Array<{ socketId: string; label: string; userId?: string; username?: string; role?: string }>;
  selfSocketId: string | null;
  canModerate: boolean;
  canHost: boolean;
  onRequestMute: (socketId: string) => void;
  onKick: (socketId: string) => void;
  onToggleCohost?: (userId: string, action: "assign" | "remove") => void;
}) {
  const [filter, setFilter] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return peers;
    return peers.filter((p) => {
      const label = (p.username || p.label || "").toLowerCase();
      const sid = (p.socketId || "").toLowerCase();
      const uid = (p.userId || "").toLowerCase();
      return label.includes(q) || sid.includes(q) || uid.includes(q);
    });
  }, [filter, peers]);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-40">
      <div className="h-full bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <div className="font-semibold flex items-center gap-2">
            <User2 className="w-5 h-5" />
            Participants
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close participants"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name or id..."
            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="text-xs text-muted-foreground mt-2">
            You: <span className="font-mono">{selfSocketId ? selfSocketId.slice(0, 8) : "—"}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No participants found.</div>
          ) : (
            filtered.map((p) => {
              const isSelf = selfSocketId && p.socketId === selfSocketId;
              const name = p.username || p.label;
              const role = (p.role || "participant").toLowerCase();
              const isCohost = role === "cohost";
              const isHost = role === "host";
              const canShowHostActions = canHost && !isSelf && !isHost && Boolean(p.userId) && Boolean(onToggleCohost);
              return (
                <div
                  key={p.socketId}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {isSelf || isHost ? (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      ) : isCohost ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="truncate">{name}</span>
                      <span
                        className={
                          isHost
                            ? "text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20"
                            : isCohost
                              ? "text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20"
                              : "text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                        }
                      >
                        {isHost ? "Host" : isCohost ? "Co-host" : "Participant"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{p.socketId}</div>
                    {p.userId ? <div className="text-[10px] text-muted-foreground font-mono">uid: {p.userId}</div> : null}
                  </div>

                  {canModerate && !isSelf ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRequestMute(p.socketId)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        title="Request mute"
                        aria-label="Request mute"
                      >
                        <MicOff className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onKick(p.socketId)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Remove"
                        aria-label="Remove"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  {canShowHostActions ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleCohost?.(String(p.userId), isCohost ? "remove" : "assign")}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        title={isCohost ? "Remove co-host" : "Make co-host"}
                        aria-label={isCohost ? "Remove co-host" : "Make co-host"}
                      >
                        {isCohost ? <UserX className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
