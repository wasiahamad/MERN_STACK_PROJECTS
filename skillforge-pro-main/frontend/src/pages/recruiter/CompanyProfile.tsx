import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Globe,
  Users,
  Edit2,
  Save,
  Shield,
  CheckCircle,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useRecruiterJobs, useRecruiterProfile, useUpdateRecruiterProfile, useUploadRecruiterLogo } from "@/lib/apiHooks";

export default function CompanyProfile() {
  const [editMode, setEditMode] = useState(false);

  const recruiterProfileQuery = useRecruiterProfile();
  const recruiterJobsQuery = useRecruiterJobs({ status: "active", pageSize: 3 });
  const updateRecruiterProfileMutation = useUpdateRecruiterProfile();
  const uploadRecruiterLogoMutation = useUploadRecruiterLogo();

  const recruiterUser = recruiterProfileQuery.data?.user;
  const profile = recruiterProfileQuery.data?.profile;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    companyName: "",
    website: "",
    industry: "",
    size: "",
    location: "",
    about: "",
  });

  useEffect(() => {
    setForm({
      name: recruiterUser?.name || "",
      phone: recruiterUser?.phone || "",
      companyName: profile?.companyName || "",
      website: profile?.website || "",
      industry: profile?.industry || "",
      size: profile?.size || "",
      location: profile?.location || "",
      about: profile?.about || "",
    });
  }, [recruiterUser?.name, recruiterUser?.phone, profile?.companyName, profile?.website, profile?.industry, profile?.size, profile?.location, profile?.about]);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const logoSrc = useMemo(() => {
    if (logoPreviewUrl) return logoPreviewUrl;
    const a = (profile?.logo || "").trim();
    if (!a) return "";
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
    return "";
  }, [profile?.logo, logoPreviewUrl]);

  const logoFallback = useMemo(() => {
    const a = (profile?.logo || "").trim();
    if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
    const name = (profile?.companyName || recruiterUser?.name || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "🏢";
  }, [profile?.logo, profile?.companyName, recruiterUser?.name]);

  const completenessScore = useMemo(() => {
    const checks = [
      { ok: Boolean((recruiterUser?.name || "").trim().length >= 2) },
      { ok: Boolean((recruiterUser?.phone || "").trim().length >= 6) },
      { ok: Boolean((profile?.companyName || "").trim().length >= 2) },
      { ok: Boolean((profile?.website || "").trim().length >= 4) },
      { ok: Boolean((profile?.industry || "").trim().length >= 2) },
      { ok: Boolean((profile?.size || "").trim().length >= 1) },
      { ok: Boolean((profile?.about || "").trim().length >= 10) },
      { ok: Boolean((profile?.location || "").trim().length >= 2) },
    ];
    const total = checks.length;
    const done = checks.filter((c) => c.ok).length;
    return Math.round((done / total) * 100);
  }, [recruiterUser?.name, recruiterUser?.phone, profile?.companyName, profile?.website, profile?.industry, profile?.size, profile?.about, profile?.location]);

  const openJobsCount = recruiterJobsQuery.data?.total ?? 0;
  const busy = updateRecruiterProfileMutation.isPending || uploadRecruiterLogoMutation.isPending;

  const onPickLogo = () => {
    if (!editMode || busy) return;
    logoInputRef.current?.click();
  };

  const onLogoSelected = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max logo size is 5MB.", variant: "destructive" });
      return;
    }

    const preview = URL.createObjectURL(file);
    setLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });

    try {
      await uploadRecruiterLogoMutation.mutateAsync(file);
      toast({ title: "Logo updated" });
      setLogoPreviewUrl(null);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const onEditSave = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      await updateRecruiterProfileMutation.mutateAsync({
        name: form.name,
        phone: form.phone,
        companyName: form.companyName,
        website: form.website,
        industry: form.industry,
        size: form.size,
        location: form.location,
        about: form.about,
      });
      setEditMode(false);
      toast({ title: "Saved", description: "Company profile updated." });
    } catch (e: any) {
      toast({ title: "Unable to save", description: e?.message || "Please try again", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="relative">
                <button
                  type="button"
                  onClick={editMode ? onPickLogo : undefined}
                  disabled={!editMode || busy}
                  className={
                    "group relative h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl md:text-6xl overflow-hidden disabled:opacity-60 " +
                    (editMode ? "cursor-pointer" : "cursor-default")
                  }
                  aria-label={editMode ? "Upload company logo" : "Company logo"}
                >
                  {logoSrc ? (
                    <img src={logoSrc} alt="Company Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span>{logoFallback}</span>
                  )}

                  {editMode && (
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white text-xs font-medium">
                        <Upload className="h-4 w-4" />
                        Upload
                      </div>
                    </div>
                  )}
                </button>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoSelected(e.target.files?.[0])}
                />

                {editMode && (
                  <button
                    type="button"
                    onClick={onPickLogo}
                    disabled={busy}
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
                    aria-label="Change logo"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    {editMode ? (
                      <div className="space-y-2">
                        <div>
                          <Label>Company Name</Label>
                          <Input
                            value={form.companyName}
                            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                            className="font-display text-2xl font-bold h-auto text-foreground"
                            placeholder="Your company name"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Recruiter Name</Label>
                            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h1 className="font-display text-2xl md:text-3xl font-bold">{profile?.companyName || "Your Company"}</h1>
                        {profile?.isComplete && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!profile?.isComplete && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                            Incomplete
                          </Badge>
                        )}
                      </div>
                    )}
                    {editMode ? (
                      <div className="mt-2">
                        <Label>Industry</Label>
                        <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} placeholder="Industry" />
                      </div>
                    ) : (
                      <p className="text-lg text-muted-foreground mt-1">{profile?.industry || "Add industry"}</p>
                    )}
                  </div>
                  <GradientButton onClick={onEditSave} disabled={busy}>
                    {editMode ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    {editMode ? "Save Changes" : "Edit Profile"}
                  </GradientButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">{completenessScore}%</p>
                    <p className="text-xs text-muted-foreground">Profile Score</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{openJobsCount}</p>
                    <p className="text-xs text-muted-foreground">Open Jobs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground">Total Hires</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {profile?.size || "Add size"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile?.location || "Add location"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a
                      href={(profile?.website || "").startsWith("http") ? profile?.website : profile?.website ? `https://${profile?.website}` : "#"}
                      className={"text-primary hover:underline" + (!profile?.website ? " opacity-50 pointer-events-none" : "")}
                      target={profile?.website ? "_blank" : undefined}
                      rel={profile?.website ? "noreferrer" : undefined}
                    >
                      {profile?.website || "Add website"}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">About the Company</h2>
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Company Description</Label>
                    <Textarea
                      value={form.about}
                      onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Industry</Label>
                      <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Input value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} className="mt-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{profile?.about || "Add a company description"}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{profile?.industry || "—"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Company Size</p>
                      <p className="font-medium">{profile?.size || "—"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{profile?.location || "—"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Website</p>
                      <p className="font-medium truncate">{profile?.website || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Trust Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Profile Completeness</h2>
              <div className="relative h-40 w-40 mx-auto mb-4">
                <svg className="h-40 w-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#trustGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${completenessScore * 4.4} 440`}
                  />
                  <defs>
                    <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(152, 70%, 45%)" />
                      <stop offset="100%" stopColor="hsl(172, 70%, 45%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-display text-4xl font-bold text-success">{completenessScore}</span>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recruiter Name</span>
                  <span className="font-medium">{recruiterUser?.name ? "✓" : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{recruiterUser?.phone ? "✓" : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company Details</span>
                  <span className="font-medium">{profile?.isComplete ? "✓" : "—"}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Active Job Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Active Job Posts</h2>
              <Badge>{openJobsCount} Open</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(recruiterJobsQuery.data?.items || []).slice(0, 3).map((job: any) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-xl">
                      {logoSrc ? (
                        <img src={logoSrc} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        logoFallback
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{job.title}</h3>
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.type}
                    </span>
                    <span className="capitalize">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
