import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { mockNotifications } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export function DashboardHeader({ onMenuClick, onLogout }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const avatarSrc = (() => {
    const a = (user?.avatar || "").trim();
    if (!a) return "";
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
    return "";
  })();

  const avatarFallback = (() => {
    const a = (user?.avatar || "").trim();
    if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
    const name = (user?.name || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "👤";
  })();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Spacer */}
        <div className="hidden lg:block" />

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-muted relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {mockNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-4 border-b border-border hover:bg-muted/50 cursor-pointer",
                            !notif.read && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full mt-2 shrink-0",
                                notif.read ? "bg-muted-foreground" : "bg-primary"
                              )}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2">
                      <button className="w-full text-center text-sm text-primary py-2 hover:underline">
                        View All Notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted"
            >
              <Avatar className="h-8 w-8 shrink-0">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt="Avatar" /> : null}
                <AvatarFallback className="text-lg">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium truncate max-w-[120px]">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-sm w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
