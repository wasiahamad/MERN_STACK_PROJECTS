import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function MeetingChat({
  open,
  onClose,
  messages,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  messages: Array<{ id: string; sender: string; text: string; at: string; isSelf: boolean }>;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  if (!open) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = text.trim();
    if (!cleaned) return;
    onSend(cleaned);
    setText("");
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-40">
      <div className="h-full bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <div className="font-semibold">Meeting Chat</div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close chat"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">No messages yet. Say hi.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.isSelf ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%]">
                  {!m.isSelf && (
                    <div className="text-xs text-muted-foreground mb-1">{m.sender}</div>
                  )}
                  <div
                    className={
                      m.isSelf
                        ? "bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2"
                        : "bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2"
                    }
                  >
                    <div className="text-sm leading-relaxed">{m.text}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
