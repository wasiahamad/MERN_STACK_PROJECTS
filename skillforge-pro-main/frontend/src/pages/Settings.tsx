import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Wallet,
  Moon,
  Sun,
  Globe,
  Mail,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hover={false} className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </GlassCard>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {activeTab === "account" && (
              <GlassCard className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Account Settings</h2>

                <div className="space-y-6">
                  {/* Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.name?.split(" ")[0]} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.name?.split(" ")[1]} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 000-0000" className="mt-1" />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                          </div>
                        </div>
                        <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Language</p>
                            <p className="text-sm text-muted-foreground">English (US)</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <GradientButton onClick={() => toast({ title: "Settings Saved!", description: "Your account settings have been updated." })}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === "notifications" && (
              <GlassCard className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Notification Settings</h2>

                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { icon: Mail, title: "Email Notifications", desc: "Receive updates via email" },
                      { icon: Smartphone, title: "Push Notifications", desc: "Receive push notifications" },
                      { icon: Bell, title: "Application Updates", desc: "Get notified about your applications" },
                      { icon: User, title: "New Job Matches", desc: "Notify when new jobs match your profile" },
                      { icon: Shield, title: "Security Alerts", desc: "Important security notifications" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Switch defaultChecked={index < 3} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <GradientButton onClick={() => toast({ title: "Preferences Saved!" })}>
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === "security" && (
              <GlassCard className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="mt-1" />
                      </div>
                    </div>
                    <Button onClick={() => toast({ title: "Password Updated!" })}>Update Password</Button>
                  </div>

                  {/* Two Factor Auth */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Key className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {[
                        { device: "MacBook Pro", location: "San Francisco, CA", current: true },
                        { device: "iPhone 14", location: "San Francisco, CA", current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-muted-foreground">{session.location}</p>
                          </div>
                          {session.current ? (
                            <Badge>Current</Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-destructive/20 pt-6">
                    <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === "wallet" && (
              <GlassCard className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Wallet Settings</h2>

                <div className="space-y-6">
                  {/* Connected Wallet */}
                  <div className="p-4 rounded-xl border border-border bg-muted/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">MetaMask Wallet</p>
                          <p className="text-sm text-muted-foreground font-mono">{user?.walletAddress}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Change Wallet
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold gradient-text">4</p>
                      <p className="text-sm text-muted-foreground">NFT Certificates</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold">{user?.reputation}</p>
                      <p className="text-sm text-muted-foreground">Reputation Score</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </div>
                  </div>

                  {/* Transaction History Link */}
                  <Button variant="outline" className="w-full">
                    View Transaction History
                  </Button>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
