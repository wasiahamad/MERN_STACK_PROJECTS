import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Mail,
  Calendar,
  CheckCircle,
  Eye,
  ChevronDown,
  Shield,
  Sparkles,
  FileText,
  Award,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Candidate } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import {
  useRecruiterCandidates,
  useRecruiterMessageCandidate,
  useRecruiterScheduleInterview,
  useRecruiterStats,
  useUpdateRecruiterCandidateStatus,
} from "@/lib/apiHooks";

const API_BASE_URL = String((import.meta as any).env?.VITE_API_URL || "")
  .trim()
  .replace(/\/$/, "");

const assetUrl = (src?: string) => {
  const s = String(src || "");
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return API_BASE_URL ? `${API_BASE_URL}${s}` : s;
  return "";
};

const statusOptions = [
  { id: "all", label: "All Candidates" },
  { id: "new", label: "New" },
  { id: "reviewed", label: "Reviewed" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
];

const statusConfig = {
  new: { color: "bg-muted text-muted-foreground", label: "New" },
  reviewed: { color: "bg-primary/10 text-primary", label: "Reviewed" },
  shortlisted: { color: "bg-accent/10 text-accent", label: "Shortlisted" },
  interview: { color: "bg-warning/10 text-warning", label: "Interview" },
  offered: { color: "bg-success/10 text-success", label: "Offered" },
  rejected: { color: "bg-destructive/10 text-destructive", label: "Rejected" },
} as const;

type RecruiterCandidate = Candidate & {
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
};

export default function Candidates() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job") || undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null);

  const { data: statsData, isLoading: statsLoading } = useRecruiterStats();
  const { data: candidatesData, isLoading: candidatesLoading, isError: candidatesIsError } = useRecruiterCandidates({
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    jobId,
    sort: "matchScore",
    limit: 100,
  });
  const updateStatus = useUpdateRecruiterCandidateStatus();
  const messageCandidate = useRecruiterMessageCandidate();
  const scheduleInterview = useRecruiterScheduleInterview();

  const stats = statsData?.pipeline;

  const candidates = useMemo(() => {
    const items = (candidatesData?.items || []) as RecruiterCandidate[];
    return items;
  }, [candidatesData?.items]);

  const handleStatusChange = (applicationId: string | undefined, newStatus: string) => {
    if (!applicationId) {
      toast({
        variant: "destructive",
        title: "Missing application",
        description: "This candidate is missing applicationId (required to update status).",
      });
      return;
    }

    updateStatus.mutate(
      { applicationId, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: "Status Updated",
            description: `Candidate status changed to ${
              (statusConfig as any)[newStatus]?.label || newStatus
            }`,
          });
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error?.message || "Failed to update status",
          });
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Candidates</span>
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage job applicants</p>
          {jobId && (
            <p className="text-xs text-muted-foreground mt-2">
              Filtered by job: <span className="font-mono">{jobId}</span>
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {statsLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <GlassCard key={i} hover={false} className="p-3 text-center">
                  <SkeletonLoader className="h-7 w-10 rounded mx-auto" />
                  <SkeletonLoader className="h-3 w-14 rounded mx-auto mt-2" />
                </GlassCard>
              ))}
            </>
          ) : (
            [
              { label: "Total", count: stats?.all || 0, color: "bg-muted" },
              { label: "New", count: stats?.new || 0, color: "bg-primary/10" },
              { label: "Shortlisted", count: stats?.shortlisted || 0, color: "bg-accent/10" },
              { label: "Interview", count: stats?.interview || 0, color: "bg-warning/10" },
              { label: "Offered", count: stats?.offered || 0, color: "bg-success/10" },
            ].map((stat) => (
              <GlassCard key={stat.label} hover={false} className="p-3 text-center">
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </GlassCard>
            ))
          )}
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hover={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      statusFilter === status.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Candidates List */}
        {candidatesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-start gap-4">
                  <SkeletonLoader className="h-14 w-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLoader className="h-4 w-40 rounded" />
                    <SkeletonLoader className="h-3 w-64 rounded" />
                    <div className="flex gap-2 pt-2">
                      <SkeletonLoader className="h-6 w-16 rounded-full" />
                      <SkeletonLoader className="h-6 w-20 rounded-full" />
                      <SkeletonLoader className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : candidatesIsError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">Failed to load candidates.</p>
          </motion.div>
        ) : candidates.length > 0 ? (
          <StaggerContainer className="space-y-4">
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.applicationId || candidate.id}
                candidate={candidate}
                rank={index + 1}
                onStatusChange={handleStatusChange}
                onSelect={() => setSelectedCandidate(candidate)}
              />
            ))}
          </StaggerContainer>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">No candidates found.</p>
          </motion.div>
        )}
      </div>

      <CandidateDetailsSheet
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onOpenChange={(v) => {
          if (!v) setSelectedCandidate(null);
        }}
        onSendMessage={async (applicationId, msg) => {
          await messageCandidate.mutateAsync({ applicationId, message: msg });
        }}
        onSchedule={async (applicationId, scheduledFor, note) => {
          await scheduleInterview.mutateAsync({ applicationId, scheduledFor, note });
        }}
      />
    </DashboardLayout>
  );
}

function CandidateDetailsSheet({
  candidate,
  open,
  onOpenChange,
  onSendMessage,
  onSchedule,
}: {
  candidate: RecruiterCandidate | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSendMessage: (applicationId: string, message: string) => Promise<void>;
  onSchedule: (applicationId: string, scheduledFor: string, note?: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const canAct = !!candidate?.applicationId;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setMessage("");
          setScheduledFor("");
          setNote("");
        }
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Candidate details</SheetTitle>
          <SheetDescription>View profile summary, match breakdown, message and schedule interview.</SheetDescription>
        </SheetHeader>

        {!candidate ? (
          <div className="mt-6 text-muted-foreground">No candidate selected.</div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden flex items-center justify-center text-2xl shrink-0">
                {candidate.avatar && (candidate.avatar.startsWith("http") || candidate.avatar.startsWith("/uploads")) ? (
                  <img src={assetUrl(candidate.avatar) || candidate.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (candidate.avatar || candidate.name?.slice(0, 1).toUpperCase() || "👤")
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold truncate">{candidate.name}</p>
                <p className="text-sm text-muted-foreground truncate">{candidate.title}</p>
                {candidate.jobTitle ? <p className="text-xs text-muted-foreground mt-1">Applied for: {candidate.jobTitle}</p> : null}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="gradient-primary text-primary-foreground">
                    {(candidate.profileMatchScore ?? candidate.matchScore ?? 0)}% Match
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified: {candidate.matchScore ?? 0}%
                  </Badge>
                  <Badge variant="outline">AI Score: {candidate.aiScore ?? 0}</Badge>
                  <Badge variant="outline" className="capitalize">{candidate.status}</Badge>
                </div>
              </div>
            </div>

            <GlassCard hover={false} className="p-4">
              <p className="text-sm font-medium mb-2">Match breakdown (verified skills)</p>
              <p className="text-xs text-muted-foreground">Matching uses candidate VERIFIED skills only. If a skill is listed but not verified, it won’t count.</p>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Matched</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(candidate.matchedSkills || []).length ? (
                      (candidate.matchedSkills || []).map((s) => (
                        <Badge key={s} className="bg-success/10 text-success">{s}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Missing</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(candidate.missingSkills || []).length ? (
                      (candidate.missingSkills || []).map((s) => (
                        <Badge key={s} className="bg-destructive/10 text-destructive">{s}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-4">
              <p className="text-sm font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills || []).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-4">
              <p className="text-sm font-medium mb-2">Resume</p>
              {(candidate as any).resumeUrl ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const url = assetUrl((candidate as any).resumeUrl);
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <FileText className="h-4 w-4" />
                  {(candidate as any).resumeFileName || "View resume"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No resume uploaded.</p>
              )}
            </GlassCard>

            {(candidate as any).certificates && Array.isArray((candidate as any).certificates) && (candidate as any).certificates.length ? (
              <GlassCard hover={false} className="p-4">
                <p className="text-sm font-medium mb-2">Certificates</p>
                <div className="space-y-2">
                  {((candidate as any).certificates as any[]).map((cert) => {
                    const url = assetUrl(cert?.image);
                    const isPdf =
                      String(cert?.fileMime || "").toLowerCase() === "application/pdf" ||
                      String(cert?.fileName || "")
                        .toLowerCase()
                        .endsWith(".pdf") ||
                      String(cert?.image || "")
                        .toLowerCase()
                        .endsWith(".pdf");

                    return (
                      <div key={String(cert?.id || cert?.name)} className="p-3 rounded-lg border border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary shrink-0" />
                              <p className="text-sm font-medium truncate">{cert?.name || "Certificate"}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{cert?.issuer || ""}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {cert?.verified ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                              ) : null}
                              {cert?.nftMinted ? (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">NFT</Badge>
                              ) : null}
                              {isPdf ? (
                                <Badge variant="secondary" className="bg-muted text-muted-foreground">PDF</Badge>
                              ) : null}
                            </div>
                          </div>
                          {url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                            >
                              View file
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ) : null}

            <GlassCard hover={false} className="p-4 space-y-3">
              <p className="text-sm font-medium">Message candidate</p>
              <div className="space-y-1">
                <Label htmlFor="msg">Message</Label>
                <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message..." />
              </div>
              <Button
                disabled={!canAct || busy || message.trim().length < 2}
                onClick={async () => {
                  if (!candidate.applicationId) return;
                  setBusy(true);
                  try {
                    await onSendMessage(candidate.applicationId, message.trim());
                    toast({ title: "Sent", description: "Message sent to candidate (notification)" });
                    setMessage("");
                  } catch (e: any) {
                    toast({ variant: "destructive", title: "Error", description: e?.message || "Failed to send" });
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                Send
              </Button>
            </GlassCard>

            <GlassCard hover={false} className="p-4 space-y-3">
              <p className="text-sm font-medium">Schedule interview</p>
              <div className="space-y-1">
                <Label htmlFor="when">Date & time</Label>
                <Input id="when" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Interview link / instructions..." />
              </div>
              <Button
                disabled={!canAct || busy || !scheduledFor}
                onClick={async () => {
                  if (!candidate.applicationId) return;
                  setBusy(true);
                  try {
                    await onSchedule(candidate.applicationId, scheduledFor, note.trim() || undefined);
                    toast({ title: "Scheduled", description: "Interview scheduled (notification + status updated)" });
                    setScheduledFor("");
                    setNote("");
                  } catch (e: any) {
                    toast({ variant: "destructive", title: "Error", description: e?.message || "Failed to schedule" });
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            </GlassCard>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CandidateCard({
  candidate,
  rank,
  onStatusChange,
  onSelect,
}: {
  candidate: RecruiterCandidate;
  rank: number;
  onStatusChange: (applicationId: string | undefined, status: string) => void;
  onSelect: () => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const status = (statusConfig as any)[candidate.status] || statusConfig.new;

  const avatarSrc = (() => {
    const a = (candidate.avatar || "").trim();
    if (!a) return "";
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return assetUrl(a) || a;
    return "";
  })();

  const avatarFallback = (() => {
    const a = (candidate.avatar || "").trim();
    if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
    const name = (candidate.name || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "👤";
  })();

  return (
    <StaggerItem>
      <GlassCard className="p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Avatar & Rank */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden flex items-center justify-center text-2xl">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  avatarFallback
                )}
              </div>
              {rank <= 3 && (
                <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-warning flex items-center justify-center">
                  <Star className="h-3 w-3 text-warning-foreground fill-current" />
                </div>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-semibold text-lg">{candidate.name}</h3>
                <p className="text-muted-foreground">{candidate.title}</p>
                {candidate.jobTitle ? (
                  <p className="text-xs text-muted-foreground mt-1">Applied for: {candidate.jobTitle}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gradient-primary text-primary-foreground">
                  {(candidate.profileMatchScore ?? candidate.matchScore ?? 0)}% Match
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Verified: {candidate.matchScore ?? 0}%
                </Badge>
                <div className="relative">
                  <button
                    onClick={() => setStatusOpen(!statusOpen)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.color}`}
                  >
                    {status.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10">
                      {Object.entries(statusConfig).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => {
                            onStatusChange(candidate.applicationId, key);
                            setStatusOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted capitalize"
                        >
                          {value.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{candidate.location}</span>
              <span>{candidate.experience} experience</span>
              <span>Applied {candidate.appliedDate}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Scores */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  AI Score: <strong>{candidate.aiScore}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-sm">
                  Reputation: <strong>{candidate.reputation}</strong>
                </span>
              </div>
              {candidate.nftCertificates.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">{candidate.nftCertificates.length} NFT Certs</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2 shrink-0">
            <GradientButton size="sm" onClick={onSelect}>
              <Eye className="h-4 w-4" />
              View Profile
            </GradientButton>
            <Button variant="outline" size="sm" onClick={onSelect}>
              <Mail className="h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" size="sm" onClick={onSelect}>
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>
      </GlassCard>
    </StaggerItem>
  );
}
