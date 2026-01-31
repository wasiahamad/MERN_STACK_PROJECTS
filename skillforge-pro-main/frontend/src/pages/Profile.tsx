import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit2,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import {
  useUpdateMe,
  useUploadAvatar,
  useAddSkill,
  useDeleteSkill,
  useAddExperience,
  useDeleteExperience,
  useAddEducation,
  useDeleteEducation,
  useSavedJobs,
} from "@/lib/apiHooks";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "education" | "skills">("overview");

  const savedJobsQuery = useSavedJobs();
  const savedJobs = savedJobsQuery.data?.items ?? [];

  const updateMeMutation = useUpdateMe();
  const uploadAvatarMutation = useUploadAvatar();
  const addSkillMutation = useAddSkill();
  const deleteSkillMutation = useDeleteSkill();
  const addExperienceMutation = useAddExperience();
  const deleteExperienceMutation = useDeleteExperience();
  const addEducationMutation = useAddEducation();
  const deleteEducationMutation = useDeleteEducation();

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    headline: "",
    location: "",
    walletAddress: "",
    about: "",
    socials: {
      github: "",
      linkedin: "",
      website: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      headline: user.headline || "",
      location: user.location || "",
      walletAddress: user.walletAddress || "",
      about: user.about || "",
      socials: {
        github: user.socials?.github || "",
        linkedin: user.socials?.linkedin || "",
        website: user.socials?.website || "",
      },
    });
  }, [user]);

  const [newSkill, setNewSkill] = useState({ name: "", level: 80 });
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: "", gpa: "" });

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const busy =
    updateMeMutation.isPending ||
    uploadAvatarMutation.isPending ||
    addSkillMutation.isPending ||
    deleteSkillMutation.isPending ||
    addExperienceMutation.isPending ||
    deleteExperienceMutation.isPending ||
    addEducationMutation.isPending ||
    deleteEducationMutation.isPending;

  const onSaveToggle = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      await updateMeMutation.mutateAsync({
        name: profileForm.name,
        phone: profileForm.phone,
        headline: profileForm.headline,
        location: profileForm.location,
        walletAddress: profileForm.walletAddress,
        about: profileForm.about,
        socials: profileForm.socials,
      });
      await refreshMe();
      setEditMode(false);
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (e: any) {
      toast({
        title: "Unable to save",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const safeUserName = useMemo(() => user?.name || "", [user?.name]);
  const safeHeadline = useMemo(() => user?.headline || "", [user?.headline]);
  const safeLocation = useMemo(() => user?.location || "", [user?.location]);
  const safeWallet = useMemo(() => user?.walletAddress || "", [user?.walletAddress]);
  const safeAbout = useMemo(() => user?.about || "", [user?.about]);

  const avatarSrc = useMemo(() => {
    if (avatarPreviewUrl) return avatarPreviewUrl;
    const a = (user?.avatar || "").trim();
    if (!a) return "";
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
    return "";
  }, [user?.avatar, avatarPreviewUrl]);

  const avatarFallback = useMemo(() => {
    const a = (user?.avatar || "").trim();
    if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a; // emoji / initial
    const name = (user?.name || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "👤";
  }, [user?.avatar, user?.name]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const onPickAvatar = () => {
    avatarInputRef.current?.click();
  };

  const onAvatarSelected = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max avatar size is 5MB.", variant: "destructive" });
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });

    try {
      await uploadAvatarMutation.mutateAsync(file);
      await refreshMe();
      toast({ title: "Avatar updated" });
      setAvatarPreviewUrl(null);
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const socialLinks = useMemo(() => {
    const github = user?.socials?.github?.trim();
    const linkedin = user?.socials?.linkedin?.trim();
    const website = user?.socials?.website?.trim();
    return {
      github: github ? (github.startsWith("http") ? github : `https://github.com/${github}`) : "",
      linkedin: linkedin ? (linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`) : "",
      website: website || "",
    };
  }, [user?.socials?.github, user?.socials?.linkedin, user?.socials?.website]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={editMode ? onPickAvatar : undefined}
                  disabled={!editMode || busy}
                  className={
                    "group relative h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden disabled:opacity-60 " +
                    (editMode ? "cursor-pointer" : "cursor-default")
                  }
                  aria-label={editMode ? "Upload avatar" : "Avatar"}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl md:text-6xl">{avatarFallback}</span>
                  )}

                  {editMode && (
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white text-xs font-medium">
                        <Edit2 className="h-4 w-4" />
                        Upload
                      </div>
                    </div>
                  )}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onAvatarSelected(e.target.files?.[0])}
                />

                {editMode && (
                  <>
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      disabled={busy}
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
                      aria-label="Change avatar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <div className="mt-3 flex justify-center">
                      <GradientButton
                        variant="outline"
                        size="sm"
                        onClick={onPickAvatar}
                        loading={uploadAvatarMutation.isPending}
                        disabled={busy}
                      >
                        Upload Photo
                      </GradientButton>
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    {editMode ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Your name"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="headline">Headline</Label>
                          <Input
                            id="headline"
                            value={profileForm.headline}
                            onChange={(e) => setProfileForm((p) => ({ ...p, headline: e.target.value }))}
                            placeholder="e.g. Frontend Developer"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="font-display text-2xl md:text-3xl font-bold">{safeUserName}</h1>
                        <p className="text-muted-foreground text-lg">
                          {safeHeadline || "Add your headline"}
                        </p>
                      </>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {editMode ? (
                          <Input
                            value={profileForm.location}
                            onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                            placeholder="Your location"
                            className="h-8 w-56"
                          />
                        ) : (
                          safeLocation || "Add location"
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        {editMode ? (
                          <Input
                            value={profileForm.walletAddress}
                            onChange={(e) => setProfileForm((p) => ({ ...p, walletAddress: e.target.value }))}
                            placeholder="0x..."
                            className="h-8 w-56"
                          />
                        ) : (
                          safeWallet || "Add wallet"
                        )}
                      </span>
                    </div>

                    {editMode && (
                      <div className="mt-4 space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <GradientButton onClick={onSaveToggle} disabled={busy}>
                    <Edit2 className="h-4 w-4" />
                    {editMode ? "Save Changes" : "Edit Profile"}
                  </GradientButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold gradient-text">{user?.aiScore}</p>
                    <p className="text-xs text-muted-foreground">AI Score</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-success">{user?.reputation}</p>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{user?.certificates?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Certificates</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">5+</p>
                    <p className="text-xs text-muted-foreground">Years Exp</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-6">
                  {editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                      <div className="space-y-1">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={profileForm.socials.github}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, socials: { ...p.socials, github: e.target.value } }))
                          }
                          placeholder="username or URL"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={profileForm.socials.linkedin}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, socials: { ...p.socials, linkedin: e.target.value } }))
                          }
                          placeholder="username or URL"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileForm.socials.website}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, socials: { ...p.socials, website: e.target.value } }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <a
                        href={socialLinks.github || "#"}
                        target={socialLinks.github ? "_blank" : undefined}
                        rel={socialLinks.github ? "noreferrer" : undefined}
                        className={
                          "p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" +
                          (!socialLinks.github ? " opacity-50 pointer-events-none" : "")
                        }
                        aria-label="GitHub"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                      <a
                        href={socialLinks.linkedin || "#"}
                        target={socialLinks.linkedin ? "_blank" : undefined}
                        rel={socialLinks.linkedin ? "noreferrer" : undefined}
                        className={
                          "p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" +
                          (!socialLinks.linkedin ? " opacity-50 pointer-events-none" : "")
                        }
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a
                        href={socialLinks.website || "#"}
                        target={socialLinks.website ? "_blank" : undefined}
                        rel={socialLinks.website ? "noreferrer" : undefined}
                        className={
                          "p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" +
                          (!socialLinks.website ? " opacity-50 pointer-events-none" : "")
                        }
                        aria-label="Website"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About */}
            <StaggerItem>
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">About Me</h3>
                {editMode ? (
                  <Textarea
                    placeholder="Tell us about yourself..."
                    className="min-h-[150px]"
                    value={profileForm.about}
                    onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {safeAbout || "Add an about section"}
                  </p>
                )}
              </GlassCard>
            </StaggerItem>

            {/* Top Skills */}
            <StaggerItem>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Top Skills</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {user?.skills?.slice(0, 5).map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            {skill.verified && (
                              <CheckCircle className="h-4 w-4 text-success" />
                            )}
                            <span className="text-xs text-muted-foreground">{skill.level}%</span>
                          </div>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>

            {/* Recent Certificates */}
            <StaggerItem className="lg:col-span-2">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Certificates</h3>
                  <a href="/certificates" className="text-primary text-sm hover:underline">
                    View All
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {user?.certificates?.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{cert.image}</span>
                        {cert.nftMinted && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            NFT
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{cert.name}</h4>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.date}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>

            {/* Saved Jobs */}
            {user?.role === "candidate" ? (
              <StaggerItem className="lg:col-span-2">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold">Saved Jobs</h3>
                    <a href="/jobs" className="text-primary text-sm hover:underline">
                      Browse Jobs
                    </a>
                  </div>

                  {savedJobsQuery.isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
                          <SkeletonLoader className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <SkeletonLoader className="h-4 w-1/2 rounded" />
                            <SkeletonLoader className="h-3 w-1/3 rounded" />
                          </div>
                          <SkeletonLoader className="h-9 w-20 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : savedJobsQuery.isError ? (
                    <p className="text-sm text-muted-foreground">Failed to load saved jobs.</p>
                  ) : savedJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {savedJobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                        >
                          <CompanyLogo
                            logo={job.logo}
                            alt={job.company ? `${job.company} logo` : "Company logo"}
                            className="h-10 w-10 rounded-lg bg-muted shrink-0 flex items-center justify-center"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{job.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {job.company} • {job.location}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </StaggerItem>
            ) : null}
          </StaggerContainer>
        )}

        {activeTab === "experience" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm" disabled={!editMode || busy}>
                <Plus className="h-4 w-4" />
                Add Experience
              </GradientButton>
            </div>

            {editMode && (
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Add Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={newExp.title} onChange={(e) => setNewExp((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={newExp.company} onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={newExp.location} onChange={(e) => setNewExp((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input value={newExp.startDate} onChange={(e) => setNewExp((p) => ({ ...p, startDate: e.target.value }))} placeholder="2024-01" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Present</Label>
                      <Switch
                        checked={newExp.current}
                        onCheckedChange={(checked) =>
                          setNewExp((p) => ({
                            ...p,
                            current: checked,
                            endDate: checked ? "" : p.endDate,
                          }))
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If you are currently working here, turn this on.
                    </p>
                  </div>

                  {!newExp.current && (
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        value={newExp.endDate}
                        onChange={(e) => setNewExp((p) => ({ ...p, endDate: e.target.value }))}
                        placeholder="2025-01"
                      />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={newExp.description} onChange={(e) => setNewExp((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <GradientButton
                    size="sm"
                    loading={addExperienceMutation.isPending}
                    onClick={async () => {
                      try {
                        await addExperienceMutation.mutateAsync({
                          title: newExp.title,
                          company: newExp.company,
                          location: newExp.location,
                          startDate: newExp.startDate,
                          endDate: newExp.current ? undefined : newExp.endDate || undefined,
                          current: newExp.current,
                          description: newExp.description,
                        });
                        await refreshMe();
                        setNewExp({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
                        toast({ title: "Added", description: "Experience added." });
                      } catch (e) {
                        toast({ title: "Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
                      }
                    }}
                  >
                    Save Experience
                  </GradientButton>
                </div>
              </GlassCard>
            )}

            {user?.experience?.map((exp) => (
              <StaggerItem key={exp.id}>
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                          <span className="mx-2">•</span>
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                        </div>
                        <p className="mt-3 text-muted-foreground">{exp.description}</p>
                      </div>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={deleteExperienceMutation.isPending}
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await deleteExperienceMutation.mutateAsync(exp.id);
                              await refreshMe();
                              toast({ title: "Deleted", description: "Experience deleted." });
                            } catch (err) {
                              toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {activeTab === "education" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm" disabled={!editMode || busy}>
                <Plus className="h-4 w-4" />
                Add Education
              </GradientButton>
            </div>

            {editMode && (
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Add Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input value={newEdu.degree} onChange={(e) => setNewEdu((p) => ({ ...p, degree: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input value={newEdu.institution} onChange={(e) => setNewEdu((p) => ({ ...p, institution: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input value={newEdu.year} onChange={(e) => setNewEdu((p) => ({ ...p, year: e.target.value }))} placeholder="2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>GPA (optional)</Label>
                    <Input value={newEdu.gpa} onChange={(e) => setNewEdu((p) => ({ ...p, gpa: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <GradientButton
                    size="sm"
                    loading={addEducationMutation.isPending}
                    onClick={async () => {
                      try {
                        await addEducationMutation.mutateAsync({
                          degree: newEdu.degree,
                          institution: newEdu.institution,
                          year: newEdu.year,
                          gpa: newEdu.gpa || undefined,
                        });
                        await refreshMe();
                        setNewEdu({ degree: "", institution: "", year: "", gpa: "" });
                        toast({ title: "Added", description: "Education added." });
                      } catch (e) {
                        toast({ title: "Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
                      }
                    }}
                  >
                    Save Education
                  </GradientButton>
                </div>
              </GlassCard>
            )}

            {user?.education?.map((edu) => (
              <StaggerItem key={edu.id}>
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>Class of {edu.year}</span>
                          {edu.gpa && (
                            <>
                              <span className="mx-2">•</span>
                              <span>GPA: {edu.gpa}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={deleteEducationMutation.isPending}
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await deleteEducationMutation.mutateAsync(edu.id);
                              await refreshMe();
                              toast({ title: "Deleted", description: "Education deleted." });
                            } catch (err) {
                              toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {activeTab === "skills" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm" disabled={!editMode || busy}>
                <Plus className="h-4 w-4" />
                Add Skill
              </GradientButton>
            </div>

            {editMode && (
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Add Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Skill Name</Label>
                    <Input value={newSkill.name} onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Level (0-100)</Label>
                    <Input
                      type="number"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill((p) => ({ ...p, level: Number(e.target.value) }))}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <GradientButton
                    size="sm"
                    loading={addSkillMutation.isPending}
                    onClick={async () => {
                      try {
                        await addSkillMutation.mutateAsync({ name: newSkill.name, level: newSkill.level, verified: false });
                        await refreshMe();
                        setNewSkill({ name: "", level: 80 });
                        toast({ title: "Added", description: "Skill saved." });
                      } catch (e) {
                        toast({ title: "Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
                      }
                    }}
                  >
                    Save Skill
                  </GradientButton>
                </div>
              </GlassCard>
            )}

            <StaggerItem>
              <GlassCard className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.skills?.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.verified && (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-3" />
                      </div>

                      {!editMode ? (
                        <Button
                          variant={skill.verified ? "outline" : "default"}
                          size="sm"
                          className="shrink-0"
                          onClick={() => navigate(`/assessment/${encodeURIComponent(skill.name)}`)}
                        >
                          {skill.verified ? "Re-test" : "Verify"}
                        </Button>
                      ) : null}

                      {editMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={deleteSkillMutation.isPending}
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await deleteSkillMutation.mutateAsync(skill.name);
                              await refreshMe();
                              toast({ title: "Deleted", description: "Skill deleted." });
                            } catch (err) {
                              toast({ title: "Failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          </StaggerContainer>
        )}
      </div>
    </DashboardLayout>
  );
}
