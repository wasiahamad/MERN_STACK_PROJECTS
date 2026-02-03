import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  User,
  FileText,
  Award,
  Bell,
  Settings,
  LogOut,
  Building,
  Users,
  Vote,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const candidateNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles, label: "Matched Jobs", path: "/dashboard/matched-jobs" },
  { icon: Briefcase, label: "Browse Jobs", path: "/jobs" },
  { icon: FileText, label: "Applications", path: "/applications" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: User, label: "My Profile", path: "/profile" },
  { icon: Award, label: "Certificates", path: "/certificates" },
  { icon: Vote, label: "DAO Governance", path: "/dao" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const recruiterNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/recruiter/dashboard" },
  { icon: Briefcase, label: "Job Posts", path: "/recruiter/jobs" },
  { icon: Users, label: "Candidates", path: "/recruiter/candidates" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Building, label: "Company", path: "/recruiter/company" },
  { icon: Vote, label: "DAO Governance", path: "/dao" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function DashboardSidebar({ isOpen, onClose, onLogout }: DashboardSidebarProps) {
  const { user, isRecruiter } = useAuth();
  const location = useLocation();
  const navItems = isRecruiter ? recruiterNavItems : candidateNavItems;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">ChainHire</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Status */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted">
          <Wallet className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Wallet Connected</p>
            <p className="text-sm font-medium truncate">{user?.walletAddress || "Not connected"}</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Overlay */}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-50 lg:hidden flex flex-col"
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </>
  );
}
