import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { CompanyLogo } from "@/components/ui/company-logo";
import { CardSkeleton, SkeletonLoader } from "@/components/ui/skeleton-loader";
import { useAuth } from "@/context/AuthContext";
import { mockApplications, mockJobs } from "@/data/mockData";

const statCards = [
  {
    title: "Applications",
    value: "12",
    change: "+3 this week",
    icon: Briefcase,
    color: "primary",
  },
  {
    title: "AI Score",
    value: "87",
    change: "+5 from last month",
    icon: TrendingUp,
    color: "accent",
  },
  {
    title: "NFT Certificates",
    value: "4",
    change: "2 pending mint",
    icon: Award,
    color: "warning",
  },
  {
    title: "Interviews",
    value: "3",
    change: "1 upcoming",
    icon: Clock,
    color: "success",
  },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  reviewing: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  shortlisted: { icon: Star, color: "text-primary", bg: "bg-primary/10" },
  interview: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10" },
  offered: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const loading = pageLoading || !user;

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
              Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your job search today.
            </p>
          </div>
          <Link to="/jobs">
            <GradientButton>
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </GradientButton>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
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

        {/* AI Score & Profile Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              {loading ? (
                <>
                  <SkeletonLoader className="h-6 w-44 rounded" />
                  <div className="mt-4 flex items-center gap-6">
                    <SkeletonLoader className="h-32 w-32 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <SkeletonLoader className="h-4 w-full rounded" />
                      <SkeletonLoader className="h-4 w-10/12 rounded" />
                      <div className="space-y-2 pt-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <SkeletonLoader className="h-4 w-24 rounded" />
                            <SkeletonLoader className="h-2 flex-1 rounded" />
                            <SkeletonLoader className="h-4 w-10 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-lg font-semibold mb-4">AI Skill Score</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32">
                      <svg className="h-32 w-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(user?.aiScore || 0) * 3.52} 352`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(252, 85%, 60%)" />
                            <stop offset="100%" stopColor="hsl(172, 70%, 45%)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-3xl font-bold">{user?.aiScore}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm mb-4">
                        Your AI-powered skill score based on experience, certifications, and verified skills.
                      </p>
                      <div className="space-y-2">
                        {user?.skills?.slice(0, 4).map((skill) => (
                          <div key={skill.name} className="flex items-center gap-2">
                            <span className="text-sm w-24 truncate">{skill.name}</span>
                            <Progress value={skill.level} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground w-8">{skill.level}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>

          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              {loading ? (
                <>
                  <SkeletonLoader className="h-6 w-48 rounded" />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <SkeletonLoader className="h-7 w-16 rounded" />
                      <SkeletonLoader className="h-6 w-28 rounded-full" />
                    </div>
                    <SkeletonLoader className="h-3 w-full rounded" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <SkeletonLoader className="h-4 w-4 rounded-full" />
                          <SkeletonLoader className="h-4 w-24 rounded" />
                        </div>
                      ))}
                    </div>
                    <SkeletonLoader className="h-11 w-full rounded-lg mt-4" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-lg font-semibold mb-4">Profile Completion</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">85%</span>
                      <Badge variant="secondary">Almost there!</Badge>
                    </div>
                    <Progress value={85} className="h-3" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {[
                        { label: "Basic Info", done: true },
                        { label: "Experience", done: true },
                        { label: "Education", done: true },
                        { label: "Skills", done: true },
                        { label: "Certificates", done: true },
                        { label: "Portfolio", done: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          {item.done ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/profile">
                      <GradientButton variant="outline" className="w-full mt-4">
                        Complete Profile
                      </GradientButton>
                    </Link>
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Recent Applications</h3>
              <Link to="/applications" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                mockApplications.slice(0, 4).map((app) => {
                  const status = statusConfig[app.status];
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <CompanyLogo
                        logo={app.job.logo}
                        alt={app.job.company ? `${app.job.company} logo` : "Company logo"}
                        className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{app.job.title}</h4>
                        <p className="text-sm text-muted-foreground">{app.job.company}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-4">
                        <Badge className="gradient-primary text-primary-foreground">{app.matchScore}% Match</Badge>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${status.bg}`}>
                          <status.icon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-sm capitalize ${status.color}`}>{app.status}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Recommended for You</h3>
              <Link to="/jobs" className="text-primary text-sm hover:underline">
                See More
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                mockJobs.slice(0, 3).map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CompanyLogo
                        logo={job.logo}
                        alt={job.company ? `${job.company} logo` : "Company logo"}
                        className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{job.location}</span>
                      <Badge variant="secondary" className="text-xs">
                        {job.matchScore}% Match
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
