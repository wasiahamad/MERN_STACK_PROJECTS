import { useEffect, useMemo, useState } from "react";
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
  Save,
  Trash2,
  Link as LinkIcon,
  CheckCircle,
  LogOut,
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
import { useTheme } from "next-themes";
import {
  useActiveSessions,
  useChangePassword,
  useDeleteAccount,
  useRevokeSession,
  useSettings,
  useUpdateMe,
  useUpdateSettings,
  useWalletStats,
} from "@/lib/apiHooks";
import { apiFetch } from "@/lib/apiClient";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function Settings() {
  const { user, refreshMe, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const updateMeMutation = useUpdateMe();
  const updateSettingsMutation = useUpdateSettings();
  const changePasswordMutation = useChangePassword();
  const { theme, setTheme } = useTheme();
  const [walletBusy, setWalletBusy] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const settingsQuery = useSettings();
  const sessionsQuery = useActiveSessions();
  const walletStatsQuery = useWalletStats();
  const revokeSessionMutation = useRevokeSession();
  const deleteAccountMutation = useDeleteAccount();

  const [accountForm, setAccountForm] = useState({
    name: "",
    phone: "",
    walletAddress: "",
    language: "en-US",
  });

  const [notificationForm, setNotificationForm] = useState({
    email: true,
    push: false,
    applicationUpdates: true,
    jobMatches: true,
    securityAlerts: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    const settings = settingsQuery.data?.settings;
    setAccountForm({
      name: user.name || "",
      phone: user.phone || "",
      walletAddress: user.walletAddress || "",
      language: settings?.language || user.settings?.language || "en-US",
    });
    setNotificationForm({
      email: settings?.notifications?.email ?? user.settings?.notifications?.email ?? true,
      push: settings?.notifications?.push ?? user.settings?.notifications?.push ?? false,
      applicationUpdates: settings?.notifications?.applicationUpdates ?? user.settings?.notifications?.applicationUpdates ?? true,
      jobMatches: settings?.notifications?.jobMatches ?? user.settings?.notifications?.jobMatches ?? true,
      securityAlerts: settings?.notifications?.securityAlerts ?? user.settings?.notifications?.securityAlerts ?? true,
    });
  }, [user, settingsQuery.data]);

  const isDark = useMemo(() => (theme ?? "system") === "dark", [theme]);

  const busy = updateMeMutation.isPending || changePasswordMutation.isPending || updateSettingsMutation.isPending;

  const settings = settingsQuery.data?.settings;
  const sessions = sessionsQuery.data?.sessions || [];
  const walletStats = walletStatsQuery.data;

  const linkWalletWithSignature = async () => {
    try {
      setWalletBusy(true);
      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        toast({
          title: "MetaMask not found",
          description: "Install MetaMask (or a compatible wallet) to link your wallet.",
          variant: "destructive",
        });
        return;
      }

      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const address = accounts?.[0];
      if (!address) {
        toast({ title: "No wallet selected", description: "Please select an account in your wallet.", variant: "destructive" });
        return;
      }

      setAccountForm((p) => ({ ...p, walletAddress: address }));

      const nonceOut = await apiFetch<{ address: string; nonce: string; message: string }>(
        `/api/me/wallet/nonce?address=${encodeURIComponent(address)}`
      );

      const signature = (await eth.request({
        method: "personal_sign",
        params: [nonceOut.message, address],
      })) as string;

      await apiFetch<{ walletAddress: string; walletVerified: boolean }>("/api/me/wallet/link", {
        method: "POST",
        body: { address, signature },
      });

      await refreshMe();
      toast({ title: "Wallet linked", description: "Wallet ownership verified successfully." });
    } catch (e: any) {
      toast({
        title: "Unable to link wallet",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setWalletBusy(false);
    }
  };

  const saveAccountAndPreferences = async () => {
    try {
      await updateMeMutation.mutateAsync({
        name: accountForm.name,
        phone: accountForm.phone,
        settings: {
          darkMode: isDark,
          language: accountForm.language,
          notifications: notificationForm,
        },
      });
      await refreshMe();
      toast({ title: "Saved", description: "Settings updated successfully." });
    } catch (e: any) {
      toast({
        title: "Unable to save",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const saveNotificationsOnly = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        darkMode: isDark,
        language: accountForm.language,
        notifications: notificationForm,
      });
      await refreshMe();
      toast({ title: "Saved", description: "Notification preferences updated." });
    } catch (e: any) {
      toast({
        title: "Unable to save",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const onChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ title: "Missing fields", description: "Please fill all password fields.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Weak password", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Mismatch", description: "Confirm password does not match.", variant: "destructive" });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated" });
    } catch (e: any) {
      toast({
        title: "Unable to update password",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const onDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      toast({ title: "Password required", description: "Enter your password to confirm.", variant: "destructive" });
      return;
    }
    try {
      await deleteAccountMutation.mutateAsync(deleteConfirmPassword);
      toast({ title: "Account deleted", description: "Your account has been deleted. Logging out..." });
      setTimeout(() => logout(), 2000);
    } catch (e: any) {
      toast({
        title: "Unable to delete account",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

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
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ""} className="mt-1" disabled />
                    </div>
                    <div>
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input
                        id="walletAddress"
                        placeholder="0x..."
                        value={accountForm.walletAddress}
                        onChange={(e) => setAccountForm((p) => ({ ...p, walletAddress: e.target.value }))}
                        className="mt-1"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                          </div>
                        </div>
                        <Switch
                          checked={isDark}
                          onCheckedChange={(checked) => {
                            setTheme(checked ? "dark" : "light");
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Language</p>
                            <p className="text-sm text-muted-foreground">Language code</p>
                          </div>
                        </div>
                        <Input
                          value={accountForm.language}
                          onChange={(e) => setAccountForm((p) => ({ ...p, language: e.target.value }))}
                          className="h-9 w-32"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <GradientButton onClick={saveAccountAndPreferences} disabled={busy}>
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
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationForm.email}
                        onCheckedChange={(checked) => setNotificationForm((p) => ({ ...p, email: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationForm.push}
                        onCheckedChange={(checked) => setNotificationForm((p) => ({ ...p, push: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Application Updates</p>
                          <p className="text-sm text-muted-foreground">Get notified about your applications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationForm.applicationUpdates}
                        onCheckedChange={(checked) => setNotificationForm((p) => ({ ...p, applicationUpdates: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">New Job Matches</p>
                          <p className="text-sm text-muted-foreground">Notify when new jobs match your profile</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationForm.jobMatches}
                        onCheckedChange={(checked) => setNotificationForm((p) => ({ ...p, jobMatches: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Security Alerts</p>
                          <p className="text-sm text-muted-foreground">Important security notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationForm.securityAlerts}
                        onCheckedChange={(checked) => setNotificationForm((p) => ({ ...p, securityAlerts: checked }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <GradientButton onClick={saveNotificationsOnly} disabled={busy}>
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
                        <Input
                          id="currentPassword"
                          type="password"
                          className="mt-1"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="mt-1"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="mt-1"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={onChangePassword} disabled={busy}>Update Password</Button>
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
                      {settings?.twoFactorEnabled ? (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Active Sessions</h3>
                    {sessionsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active sessions</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session, index) => (
                          <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                            <div>
                              <p className="font-medium">{session.device || "Unknown Device"}</p>
                              <p className="text-sm text-muted-foreground">{session.location || "Unknown Location"}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last active: {new Date(session.lastActive).toLocaleString()}
                              </p>
                            </div>
                            {index === 0 ? (
                              <Badge>Current</Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                disabled={revokeSessionMutation.isPending}
                                onClick={() => {
                                  revokeSessionMutation.mutate(session.id, {
                                    onSuccess: () => {
                                      toast({ title: "Session revoked" });
                                      sessionsQuery.refetch();
                                    },
                                    onError: (e: any) => {
                                      toast({ title: "Failed to revoke session", description: e?.message, variant: "destructive" });
                                    },
                                  });
                                }}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-destructive/20 pt-6">
                    <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleteAccountMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>

                    {showDeleteModal && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            This action cannot be undone. Enter your password to confirm.
                          </p>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            value={deleteConfirmPassword}
                            onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                            className="mb-4"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteConfirmPassword("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={onDeleteAccount}
                              disabled={deleteAccountMutation.isPending || !deleteConfirmPassword}
                            >
                              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                      }}
                    >
                      Logout
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
                          <p className="text-sm text-muted-foreground font-mono">{user?.walletAddress || "Not linked"}</p>
                        </div>
                      </div>
                      {user?.walletAddress && user?.walletVerified ? (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={linkWalletWithSignature} disabled={walletBusy}>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        {walletBusy ? "Linking..." : "Change Wallet"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          toast({ title: "Not supported", description: "Wallet disconnect isn't available yet." });
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Update Wallet Address</h3>
                    <div className="space-y-3">
                      <Input
                        value={accountForm.walletAddress}
                        onChange={(e) => setAccountForm((p) => ({ ...p, walletAddress: e.target.value }))}
                        placeholder="0x..."
                      />
                      <div className="flex justify-end">
                        <GradientButton onClick={linkWalletWithSignature} disabled={busy || walletBusy}>
                          <Save className="h-4 w-4" />
                          {walletBusy ? "Linking..." : "Save Wallet"}
                        </GradientButton>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold gradient-text">{walletStats?.nftCertificates ?? 0}</p>
                      <p className="text-sm text-muted-foreground">NFT Certificates</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold">{walletStats?.reputation ?? user?.reputation ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Reputation Score</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border text-center">
                      <p className="text-2xl font-bold">{walletStats?.transactions ?? 0}</p>
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
