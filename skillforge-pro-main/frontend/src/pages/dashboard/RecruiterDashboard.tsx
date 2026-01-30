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
  Loader2,
  XCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
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

  const statCards = [
    {
      title: "Active Jobs",
      value: stats?.jobs?.active ?? 0,
      change: `${stats?.jobs?.total ?? 0} total`,
      icon: Briefcase,
      color: "primary" as const,
    },
    {
      title: "Total Applicants",
      value: stats?.applicants?.total ?? 0,
      change: "Across all jobs",
      icon: Users,
      color: "accent" as const,
    },
    {
      title: "New Candidates",
      value: stats?.pipeline?.new ?? 0,
      change: "Need review",
      icon: Star,
      color: "warning" as const,
    },
    {
      title: "Profile",
      value: stats?.profile?.isComplete ? "Complete" : "Incomplete",
      change: stats?.profile?.isComplete ? "Ready to post" : "Complete your company profile",
      icon: TrendingUp,
      color: "success" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Recruiter <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage your job posts and find the best candidates.</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <GradientButton>
              <Plus className="h-4 w-4" />
              Post New Job
            </GradientButton>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <StaggerItem key={stat.title}>
              <GlassCard className="p-6">
                {statsLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  </div>
                ) : statsError ? (
                  <p className="text-sm text-muted-foreground">Failed to load stats</p>
                ) : (
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
                )}
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Job Performance & Top Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Job Posts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Active Job Posts</h3>
                <Link to="/recruiter/jobs" className="text-primary text-sm hover:underline">
                  View All
                </Link>
              </div>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length ? (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const logoSrc = (job.companyLogo || "").trim();
                    const showImg = logoSrc.startsWith("http://") || logoSrc.startsWith("https://") || logoSrc.startsWith("/uploads");
                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center text-xl shrink-0">
                          {showImg ? <img src={logoSrc} alt="Logo" className="h-full w-full object-cover" /> : "🏢"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{job.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {job.applicantsCount || 0} applicants
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          {job.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active jobs yet.</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Top Candidates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Top Candidates</h3>
                <Link to="/recruiter/candidates" className="text-primary text-sm hover:underline">
                  View All
                </Link>
              </div>
              {candidatesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : candidates.length ? (
                <div className="space-y-4">
                  {candidates.map((candidate, index) => {
                    const avatarSrc = (() => {
                      const a = (candidate.avatar || "").trim();
                      if (!a) return "";
                      if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
                      return "";
                    })();

                    const avatarFallback = (() => {
                      const a = (candidate.avatar || "").trim();
                      if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
                      const name = (candidate.name || "").trim();
                      return name ? name.slice(0, 1).toUpperCase() : "👤";
                    })();

                    return (
                      <div
                        key={candidate.applicationId || candidate.id}
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
                          <Badge className="gradient-primary text-primary-foreground">{candidate.matchScore}%</Badge>
                          <p className="text-xs text-muted-foreground mt-1">AI: {candidate.aiScore}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No candidates yet.</p>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Pipeline Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Hiring Pipeline</h3>
            {statsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "New", count: stats?.pipeline?.new ?? 0, color: "bg-muted" },
                  { label: "Reviewed", count: stats?.pipeline?.reviewed ?? 0, color: "bg-primary/20" },
                  { label: "Shortlisted", count: stats?.pipeline?.shortlisted ?? 0, color: "bg-accent/20" },
                  { label: "Interview", count: stats?.pipeline?.interview ?? 0, color: "bg-warning/20" },
                  { label: "Offered", count: stats?.pipeline?.offered ?? 0, color: "bg-success/20" },
                  { label: "Rejected", count: stats?.pipeline?.rejected ?? 0, color: "bg-destructive/20" },
                ].map((stage, index) => (
                  <div key={stage.label} className={`p-4 rounded-xl ${stage.color} text-center relative`}>
                    <p className="text-2xl font-bold">{stage.count}</p>
                    <p className="text-sm text-muted-foreground">{stage.label}</p>
                    {index < 5 && (
                      <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Recent Activity</h3>
            {activityLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activity.length ? (
              <div className="space-y-4">
                {activity.map((item: any) => {
                  const Icon = item?.type === "job" ? Briefcase : item?.type === "application" ? Users : Clock;
                  const color = item?.type === "job" ? "text-primary" : item?.type === "application" ? "text-success" : "text-muted-foreground";
                  return (
                    <div key={`${item?.type}-${item?.id}`} className="flex items-start gap-4">
                      <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item?.message || item?.title || "Activity"}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(item?.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                No recent activity.
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

