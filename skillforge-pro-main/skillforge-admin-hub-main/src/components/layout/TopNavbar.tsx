import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { notifications } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";

export default function TopNavbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search users, skills, assessments..."
          className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <div ref={themeRef} className="relative">
          <button onClick={() => setShowTheme(!showTheme)}
            className="rounded-lg p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <AnimatePresence>
            {showTheme && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 w-40 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
                {[
                  { value: "light" as const, label: "Light", icon: Sun },
                  { value: "dark" as const, label: "Dark", icon: Moon },
                  { value: "system" as const, label: "System", icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => { setTheme(value); setShowTheme(false); }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      theme === value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifsRef} className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-lg p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 w-80 rounded-lg border border-border bg-card shadow-lg z-50">
                <div className="border-b border-border p-3">
                  <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex gap-3 border-b border-border p-3 transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <button className="w-full rounded-md py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">admin@skillforge.io</p>
          </div>
        </button>
      </div>
    </header>
  );
}
