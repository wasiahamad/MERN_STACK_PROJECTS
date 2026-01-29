import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  ArrowRight,
  Plus,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { mockJobs, mockCandidates } from "@/data/mockData";

const statCards = [
  {
    title: "Active Jobs",
    value: "8",
    change: "+2 this month",
    icon: Briefcase,
    color: "primary",
  },
  {
    title: "Total Applicants",
    value: "234",
    change: "+45 this week",
    icon: Users,
    color: "accent",
  },
  {
    title: "Profile Views",
    value: "1.2K",
    change: "+15% from last month",
    icon: Eye,
    color: "warning",
  },
  {
    title: "Trust Score",
    value: "95",
    change: "Top 5% of recruiters",
    icon: TrendingUp,
    color: "success",
  },
];

export default function RecruiterDashboard() {
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
            <p className="text-muted-foreground mt-1">
              Manage your job posts and find the best candidates.
            </p>
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

        {/* Job Performance & Top Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Job Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Active Job Posts</h3>
                <Link to="/recruiter/jobs" className="text-primary text-sm hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {mockJobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{job.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {job.applicants} applicants
                        <Eye className="h-3 w-3 ml-2" />
                        {job.views} views
                      </div>
                    </div>
                    {job.verified && (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Top Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Top Candidates</h3>
                <Link to="/recruiter/candidates" className="text-primary text-sm hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {mockCandidates
                  .sort((a, b) => b.matchScore - a.matchScore)
                  .slice(0, 4)
                  .map((candidate, index) => (
                    (() => {
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
                      key={candidate.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xl shrink-0">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            avatarFallback
                          )}
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
                        <Badge className="gradient-primary text-primary-foreground">
                          {candidate.matchScore}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">AI: {candidate.aiScore}</p>
                      </div>
                    </div>
                      );
                    })()
                  ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Hiring Pipeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "New", count: 45, color: "bg-muted" },
                { label: "Reviewed", count: 32, color: "bg-primary/20" },
                { label: "Shortlisted", count: 18, color: "bg-accent/20" },
                { label: "Interview", count: 8, color: "bg-warning/20" },
                { label: "Offered", count: 3, color: "bg-success/20" },
                { label: "Hired", count: 2, color: "bg-success" },
              ].map((stage, index) => (
                <div
                  key={stage.label}
                  className={`p-4 rounded-xl ${stage.color} text-center relative`}
                >
                  <p className="text-2xl font-bold">{stage.count}</p>
                  <p className="text-sm text-muted-foreground">{stage.label}</p>
                  {index < 5 && (
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-muted-foreground hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                {
                  icon: Users,
                  text: "New application from Alex Johnson for Senior Blockchain Developer",
                  time: "2 hours ago",
                  color: "text-primary",
                },
                {
                  icon: CheckCircle,
                  text: "Emily Rodriguez accepted interview for Smart Contract Auditor",
                  time: "5 hours ago",
                  color: "text-success",
                },
                {
                  icon: Star,
                  text: "Lisa Wang shortlisted for Senior Blockchain Developer",
                  time: "1 day ago",
                  color: "text-warning",
                },
                {
                  icon: Clock,
                  text: "Interview scheduled with Michael Park for Full Stack Developer",
                  time: "2 days ago",
                  color: "text-accent",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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
