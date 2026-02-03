import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useMarkNotificationRead, useNotifications, useReadAllNotifications } from "@/lib/apiHooks";

function formatTime(t: string) {
  const s = String(t || "").trim();
  const d = new Date(s);
  if (!s) return "";
  if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  return s;
}

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const q = useNotifications(unreadOnly);
  const mark = useMarkNotificationRead();
  const readAll = useReadAllNotifications();

  const items = useMemo(() => q.data?.items || [], [q.data?.items]);
  const unreadCount = useMemo(() => items.filter((n: any) => !n.read).length, [items]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">{unreadCount} unread</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={unreadOnly ? "default" : "outline"}
                onClick={() => setUnreadOnly((v) => !v)}
              >
                {unreadOnly ? "Showing unread" : "Show unread"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  readAll.mutate(undefined, {
                    onSuccess: () => toast({ title: "Done", description: "All notifications marked read" }),
                    onError: (err: any) =>
                      toast({ variant: "destructive", title: "Error", description: err?.message || "Failed" }),
                  });
                }}
                disabled={readAll.isPending}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            </div>
          </div>
        </motion.div>

        <GlassCard hover={false} className="p-0 overflow-hidden">
          {q.isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : q.isError ? (
            <div className="p-6">
              <p className="text-muted-foreground">Failed to load notifications.</p>
            </div>
          ) : items.length ? (
            <div className="divide-y divide-border">
              {items.map((n: any) => (
                <button
                  key={n.id}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => {
                    mark.mutate(
                      { id: n.id, read: true },
                      {
                        onError: (err: any) =>
                          toast({ variant: "destructive", title: "Error", description: err?.message || "Failed" }),
                      }
                    );
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{n.title}</p>
                        {!n.read ? <Badge className="bg-primary/10 text-primary">New</Badge> : null}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatTime(n.time)}</p>
                    </div>
                    <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", n.read ? "bg-muted-foreground" : "bg-primary")} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-muted-foreground">No notifications.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
