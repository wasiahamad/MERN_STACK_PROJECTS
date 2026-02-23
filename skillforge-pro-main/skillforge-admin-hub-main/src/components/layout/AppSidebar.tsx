import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Zap,
  ClipboardCheck,
  Award,
  BarChart3,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Users", icon: Users, path: "/users" },
  { label: "Recruiters", icon: Briefcase, path: "/recruiters" },
  { label: "Skills", icon: Zap, path: "/skills" },
  { label: "Assessments", icon: ClipboardCheck, path: "/assessments" },
  { label: "NFT Certificates", icon: Award, path: "/nft" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Monetization", icon: DollarSign, path: "/monetization" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-lg font-bold text-foreground"
            >
              SkillForge Pro
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 h-8 w-[3px] rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
