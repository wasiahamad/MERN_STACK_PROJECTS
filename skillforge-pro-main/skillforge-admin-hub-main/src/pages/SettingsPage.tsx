import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Globe } from "lucide-react";
import { settingsData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonCard from "@/components/dashboard/SkeletonCard";

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}>
      <motion.div animate={{ x: enabled ? 20 : 2 }} className="absolute top-1 h-4 w-4 rounded-full bg-primary-foreground shadow" />
    </button>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState(settingsData.notifications);
  const [security, setSecurity] = useState(settingsData.security);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t); }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage platform configuration and preferences</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* General */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">General</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(settingsData.general).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(notifs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <ToggleSwitch enabled={value} onToggle={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Security</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(security).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  {typeof value === "boolean" ? (
                    <ToggleSwitch enabled={value} onToggle={() => setSecurity((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
                  ) : (
                    <span className="text-sm font-medium text-foreground">{value}{key === "sessionTimeout" ? " min" : ""}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Platform Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Platform</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium text-foreground">2.4.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Production</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Operational
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
