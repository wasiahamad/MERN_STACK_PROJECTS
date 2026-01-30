import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Star,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import type { Candidate } from "@/data/mockData";
import { useRecruiterActivity, useRecruiterCandidates, useRecruiterJobs, useRecruiterStats } from "@/lib/apiHooks";

type RecruiterJob = {
  id: string;
  title: string;
  location: string;
  type: string;
  status: "active" | "paused" | "closed";
  applicantsCount?: number;
  companyLogo?: string;
};

type RecruiterCandidate = Candidate & {
  applicationId?: string;
};

function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const ms = Date.now() - d.getTime();
  if (!Number.isFinite(ms)) return "";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function RecruiterDashboard() {
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useRecruiterStats();
  const { data: jobsData, isLoading: jobsLoading } = useRecruiterJobs({ status: "active", limit: 4 });
  const { data: candidatesData, isLoading: candidatesLoading } = useRecruiterCandidates({ sort: "matchScore", limit: 4 });
  const { data: activityData, isLoading: activityLoading } = useRecruiterActivity(8);

  const stats = statsData;
  const jobs = useMemo(() => (jobsData?.items || []) as RecruiterJob[], [jobsData?.items]);
  const candidates = useMemo(() => (candidatesData?.items || []) as RecruiterCandidate[], [candidatesData?.items]);
  const activity = useMemo(() => activityData?.items || [], [activityData?.items]);

  const isLoading = statsLoading || jobsLoading || candidatesLoading || activityLoading;

      const statCards = useMemo(
        () => [
          {
            title: "Active Jobs",
            value: String(stats?.jobs?.active ?? 0),
            change: `${stats?.jobs?.total ?? 0} total`,
            icon: Briefcase,
            color: "primary" as const,
          },
          {
            title: "Total Applicants",
            value: String(stats?.applicants?.total ?? 0),
            change: "Across all jobs",
            icon: Users,
            color: "accent" as const,
          },
          {
            title: "Pipeline",
            value: String(stats?.pipeline?.all ?? 0),
            change: "Applications in progress",
            icon: TrendingUp,
            color: "warning" as const,
          },
          {
            title: "Profile",
            value: stats?.profile?.isComplete ? "Complete" : "Incomplete",
            change: stats?.profile?.isComplete ? "Ready to post" : "Finish profile for trust",
            icon: CheckCircle,
            color: "success" as const,
          },
        ],
        [stats]
      );

      const pipelineStages = useMemo(
        () => [
          { key: "new", label: "New", count: stats?.pipeline?.new ?? 0 },
          { key: "reviewed", label: "Reviewed", count: stats?.pipeline?.reviewed ?? 0 },
          { key: "shortlisted", label: "Shortlisted", count: stats?.pipeline?.shortlisted ?? 0 },
          { key: "interview", label: "Interview", count: stats?.pipeline?.interview ?? 0 },
          { key: "offered", label: "Offered", count: stats?.pipeline?.offered ?? 0 },
          { key: "rejected", label: "Rejected", count: stats?.pipeline?.rejected ?? 0 },
        ],
        [stats]
      );

      return (
        <DashboardLayout>
          <div className="space-y-8">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Recruiter <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1">Manage your job posts and candidates.</p>
              </div>
              <Link to="/recruiter/jobs/new">
                <GradientButton>
                  <Plus className="h-4 w-4" />
                  Post New Job
                </GradientButton>
              </Link>
            </motion.div>

            {/* High-level errors */}
            {statsError && (
              <GlassCard className="p-6 border border-destructive/40">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm">Unable to load recruiter stats.</p>
                </div>
              </GlassCard>
            )}

            {/* Stats */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <StaggerItem key={i}>
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <SkeletonLoader className="h-4 w-28 rounded" />
                            <SkeletonLoader className="h-9 w-20 rounded" />
                            <SkeletonLoader className="h-3 w-32 rounded" />
                          </div>
                          <SkeletonLoader className="h-12 w-12 rounded-xl" />
                        </div>
                      </GlassCard>
                    </StaggerItem>
                  ))
                : statCards.map((stat) => (
                    <StaggerItem key={stat.title}>
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-muted-foreground text-sm">{stat.title}</p>
                            <h3 className="font-display text-3xl font-bold mt-1">{stat.value}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                          </div>
                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              stat.color === "primary"
                                ? "bg-primary/10 text-primary"
                                : stat.color === "accent"
                                ? "bg-accent/10 text-accent"
                                : stat.color === "warning"
                                ? "bg-warning/10 text-warning"
                                : "bg-success/10 text-success"
                            }`}
                          >
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                      </GlassCard>
                    </StaggerItem>
                  ))}
            </StaggerContainer>

            {/* Jobs + Candidates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold">Active Job Posts</h3>
                    <Link to="/recruiter/jobs" className="text-primary text-sm hover:underline">
                      View All
                    </Link>
                  </div>

                  {jobsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                          <SkeletonLoader className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <SkeletonLoader className="h-4 w-2/3 rounded" />
                            <SkeletonLoader className="h-3 w-1/2 rounded" />
                          </div>
                          <SkeletonLoader className="h-6 w-20 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : jobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active jobs yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-sm shrink-0">
                            {job.companyLogo ? <img src={job.companyLogo} alt="" className="h-full w-full object-cover" /> : <Briefcase className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{job.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {job.location} • {job.type}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-muted/50">
                            {job.applicantsCount ?? 0} applicants
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold">Top Candidates</h3>
                    <Link to="/recruiter/candidates" className="text-primary text-sm hover:underline">
                      View All
                    </Link>
                  </div>

                  {candidatesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                          <SkeletonLoader className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <SkeletonLoader className="h-4 w-1/2 rounded" />
                            <SkeletonLoader className="h-3 w-2/3 rounded" />
                          </div>
                          <div className="space-y-2 text-right">
                            <SkeletonLoader className="h-6 w-16 rounded-full ml-auto" />
                            <SkeletonLoader className="h-3 w-12 rounded ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : candidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No candidates yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {candidates.slice(0, 4).map((candidate, index) => {
                        const avatarSrc = (() => {
                          const a = String(candidate.avatar || "").trim();
                          if (!a) return "";
                          if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
                          return "";
                        })();

                        const avatarFallback = (() => {
                          const a = String(candidate.avatar || "").trim();
                          if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
                          const name = String(candidate.name || "").trim();
                          return name ? name.slice(0, 1).toUpperCase() : "👤";
                        })();

                        return (
                          <div
                            key={candidate.id}
                            className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                          >
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xl shrink-0">
                                {avatarSrc ? <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" /> : avatarFallback}
                              </div>
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning flex items-center justify-center">
                                  <Star className="h-3 w-3 text-warning-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{candidate.title}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="gradient-primary text-primary-foreground">{candidate.matchScore ?? 0}%</Badge>
                              <p className="text-xs text-muted-foreground mt-1">AI: {candidate.aiScore ?? 0}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            </div>

            {/* Pipeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-6">Hiring Pipeline</h3>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/30 text-center">
                        <SkeletonLoader className="h-8 w-10 rounded mx-auto" />
                        <SkeletonLoader className="h-4 w-16 rounded mx-auto mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {pipelineStages.map((stage, index) => (
                      <div key={stage.key} className="p-4 rounded-xl bg-muted/30 text-center relative">
                        <p className="text-2xl font-bold">{stage.count}</p>
                        <p className="text-sm text-muted-foreground">{stage.label}</p>
                        {index < pipelineStages.length - 1 && (
                          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-muted-foreground hidden lg:block" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-6">Recent Activity</h3>

                {activityLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <SkeletonLoader className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <SkeletonLoader className="h-4 w-40 rounded" />
                          <SkeletonLoader className="h-4 w-10/12 rounded" />
                          <SkeletonLoader className="h-3 w-24 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {activity.map((item: any) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {item.type === "application" ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title || "Activity"}</p>
                          <p className="text-sm text-muted-foreground">{item.message || ""}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" /> {timeAgo(item.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </DashboardLayout>
      );
    }

