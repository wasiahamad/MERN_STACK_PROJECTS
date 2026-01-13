import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Copy,
  Loader2,
  LogOut,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  User2,
  Video,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useCreateMeeting,
  useDeleteMeeting,
  useMeetings,
  useScheduleMeeting,
  useUpdateMeeting,
  type Meeting,
} from "@/hooks/use-meetings";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function getMeetingStatus(m: Meeting) {
  const scheduledAt = m.scheduledAt ? new Date(m.scheduledAt).getTime() : 0;
  const durationMin = Number(m.duration || 0);
  if (!scheduledAt || !durationMin) return "instant" as const;
  const end = scheduledAt + durationMin * 60 * 1000;
  return end < Date.now() ? ("completed" as const) : ("scheduled" as const);
}

function toLocalDatetimeInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const meetingsQuery = useMeetings();
  const meetings = meetingsQuery.data || [];

  const createMeeting = useCreateMeeting();
  const scheduleMeeting = useScheduleMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();

  const [joinCode, setJoinCode] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    title: "Weekly Design Sync",
    scheduledAt: toLocalDatetimeInputValue(new Date(Date.now() + 60 * 60 * 1000)),
    duration: 45,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Meeting | null>(null);
  const [editForm, setEditForm] = useState({ title: "", scheduledAt: "", duration: 45 });

  const [profileForm, setProfileForm] = useState({
    name: "",
    username: user?.username || "",
    email: user?.email || "",
    avatarUrl: "",
  });

  const visibleMeetings = useMemo(() => {
    return [...meetings]
      .map((m) => ({ ...m, status: m.status || getMeetingStatus(m) }))
      .slice(0, 12);
  }, [meetings]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinCode.trim();
    if (!trimmed) return;
    setLocation(`/meeting/${trimmed}`);
  };

  const handleNewMeeting = async () => {
    try {
      const meeting = await createMeeting.mutateAsync("New Meeting");
      setLocation(`/meeting/${meeting.roomId}`);
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not create meeting", variant: "destructive" });
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const meeting = await scheduleMeeting.mutateAsync({
        title: scheduleForm.title,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        duration: Number(scheduleForm.duration),
      });
      setScheduleOpen(false);
      toast({ title: "Scheduled", description: `Meeting code: ${meeting.roomId}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not schedule meeting", variant: "destructive" });
    }
  };

  const openEdit = (m: Meeting) => {
    setEditTarget(m);
    setEditForm({
      title: m.title || "Meeting",
      scheduledAt: toLocalDatetimeInputValue(m.scheduledAt ? new Date(m.scheduledAt) : new Date(m.createdAt)),
      duration: Number(m.duration || 45),
    });
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      await updateMeeting.mutateAsync({
        id: editTarget.id,
        title: editForm.title,
        scheduledAt: new Date(editForm.scheduledAt).toISOString(),
        duration: Number(editForm.duration),
      });
      setEditOpen(false);
      toast({ title: "Updated", description: "Meeting updated successfully" });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not update meeting", variant: "destructive" });
    }
  };

  const handleDelete = async (m: Meeting) => {
    if (!confirm("Delete this meeting?") ) return;
    try {
      await deleteMeeting.mutateAsync(m.id);
      toast({ title: "Deleted", description: "Meeting removed" });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not delete meeting", variant: "destructive" });
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied", description: "Meeting code copied" });
    } catch {
      toast({ title: "Copy failed", description: code });
    }
  };

  const openProfile = () => {
    const p = profileQuery.data;
    setProfileForm({
      name: p?.name || "",
      username: p?.username || user?.username || "",
      email: p?.email || user?.email || "",
      avatarUrl: p?.avatarUrl || "",
    });
    setProfileOpen(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: profileForm.name,
        username: profileForm.username,
        email: profileForm.email,
        avatarUrl: profileForm.avatarUrl,
      });
      setProfileOpen(false);
      toast({ title: "Saved", description: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not update profile", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Video className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl">ZoomClone</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-white/5 hover:bg-white/5 transition-colors"
              title="Profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {(user?.username || "U").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
            </button>
            <button
              onClick={() => logout.mutate()}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left: Quick actions + profile */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-card rounded-3xl border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5">
                <h2 className="font-display font-bold text-xl">Quick Actions</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleNewMeeting}
                    disabled={createMeeting.isPending}
                    className="rounded-2xl p-5 bg-primary/15 border border-primary/25 hover:bg-primary/20 transition-colors flex flex-col items-center justify-center gap-3"
                  >
                    {createMeeting.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Plus className="w-6 h-6" />
                      </div>
                    )}
                    <div className="font-semibold">New Meeting</div>
                  </button>

                  <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                    <DialogTrigger asChild>
                      <button className="rounded-2xl p-5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 text-foreground flex items-center justify-center border border-white/10">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="font-semibold">Schedule</div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-background border border-white/10">
                      <DialogHeader>
                        <DialogTitle>Schedule a meeting</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSchedule} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Title</label>
                          <input
                            value={scheduleForm.title}
                            onChange={(e) => setScheduleForm((p) => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Meeting title"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Date & time</label>
                            <input
                              type="datetime-local"
                              value={scheduleForm.scheduledAt}
                              onChange={(e) => setScheduleForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Duration (min)</label>
                            <input
                              type="number"
                              min={5}
                              value={scheduleForm.duration}
                              onChange={(e) => setScheduleForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={scheduleMeeting.isPending}
                          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
                        >
                          {scheduleMeeting.isPending ? "Scheduling..." : "Schedule Meeting"}
                        </button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <form onSubmit={handleJoin} className="space-y-3">
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter meeting code"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold disabled:opacity-50 transition-colors"
                  >
                    Join Meeting
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-primary/70 to-purple-600/70 p-[1px] shadow-2xl shadow-primary/15">
              <div className="rounded-3xl bg-background/70 backdrop-blur-md p-6 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <User2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{profileQuery.data?.name || user?.username}</div>
                    <div className="text-sm text-muted-foreground">{profileQuery.data?.email || user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={openProfile}
                  className="mt-5 w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-semibold"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right: Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Recent Activity</h2>
                <div className="text-sm text-muted-foreground">Dashboard</div>
              </div>

              <div className="divide-y divide-white/5">
                {meetingsQuery.isLoading ? (
                  <div className="p-10 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : visibleMeetings.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <p>No activity yet.</p>
                    <p className="text-sm mt-2">Create or schedule a meeting to see it here.</p>
                  </div>
                ) : (
                  visibleMeetings.map((m) => {
                    const status = m.status || getMeetingStatus(m);
                    const when = m.scheduledAt ? new Date(m.scheduledAt) : new Date(m.createdAt);
                    return (
                      <div key={m.id} className="p-6 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{m.title || "Meeting"}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Hosted by {user?.username} • {Number(m.duration || 45)} mins
                              </div>
                              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{format(when, "MMM d, yyyy")}</span>
                                <span className="text-white/20">•</span>
                                <span className="font-mono">{m.roomId}</span>
                                <span
                                  className={
                                    status === "completed"
                                      ? "px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20"
                                      : status === "scheduled"
                                        ? "px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20"
                                        : "px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                                  }
                                >
                                  {status === "completed" ? "Completed" : status === "scheduled" ? "Scheduled" : "Instant"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setLocation(`/meeting/${m.roomId}`)}
                              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
                            >
                              Start
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                                  title="More"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border border-white/10">
                                <DropdownMenuItem onClick={() => handleCopy(m.roomId)}>
                                  <Copy className="w-4 h-4 mr-2" /> Copy code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(m)}>
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(m)}
                                  className="text-red-400 focus:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Meeting Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg bg-background border border-white/10">
          <DialogHeader>
            <DialogTitle>Edit meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date & time</label>
                <input
                  type="datetime-local"
                  value={editForm.scheduledAt}
                  onChange={(e) => setEditForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Duration (min)</label>
                <input
                  type="number"
                  min={5}
                  value={editForm.duration}
                  onChange={(e) => setEditForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMeeting.isPending}
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
            >
              {updateMeeting.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-lg bg-background border border-white/10">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Your name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Username</label>
                <input
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Avatar URL (optional)</label>
              <input
                value={profileForm.avatarUrl}
                onChange={(e) => setProfileForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
            >
              {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
