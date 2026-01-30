import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  ArrowRight,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { CardSkeleton, SkeletonLoader } from "@/components/ui/skeleton-loader";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import type { Application } from "@/data/mockData";
import { useMyApplications } from "@/lib/apiHooks";

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Pending Review" },
  reviewing: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", label: "Under Review" },
  shortlisted: { icon: Star, color: "text-primary", bg: "bg-primary/10", label: "Shortlisted" },
  interview: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10", label: "Interview Stage" },
  offered: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Offer Received" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Not Selected" },
};

const filterTabs = [
  { id: "all", label: "All Applications" },
  { id: "pending", label: "Pending" },
  { id: "reviewing", label: "In Review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
];

export default function Applications() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryStatus = activeFilter === "all" ? undefined : activeFilter;
  const { data, isLoading, isError, error } = useMyApplications({
    status: queryStatus,
    search: searchQuery.trim() || undefined,
    page: 1,
    pageSize: 50,
  });

  const applications = useMemo(() => {
    const items = data?.items ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((app) => {
      const title = app.job?.title?.toLowerCase() || "";
      const company = app.job?.company?.toLowerCase() || "";
      return title.includes(q) || company.includes(q);
    });
  }, [data?.items, searchQuery]);

  const stats = useMemo(() => {
    const all = data?.items ?? [];
    return {
      total: all.length,
      reviewing: all.filter((a) => a.status === "reviewing").length,
      interview: all.filter((a) => a.status === "interview").length,
      offered: all.filter((a) => a.status === "offered").length,
    };
  }, [data?.items]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            My <span className="gradient-text">Applications</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your job applications
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <GlassCard key={i} hover={false} className="p-4 text-center">
                  <SkeletonLoader className="h-7 w-12 mx-auto rounded" />
                  <SkeletonLoader className="h-4 w-24 mx-auto rounded mt-2" />
                </GlassCard>
              ))}
            </>
          ) : (
            <>
              <GlassCard hover={false} className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Applied</p>
              </GlassCard>
              <GlassCard hover={false} className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{stats.reviewing}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </GlassCard>
              <GlassCard hover={false} className="p-4 text-center">
                <p className="text-2xl font-bold text-accent">{stats.interview}</p>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </GlassCard>
              <GlassCard hover={false} className="p-4 text-center">
                <p className="text-2xl font-bold text-success">{stats.offered}</p>
                <p className="text-sm text-muted-foreground">Offers</p>
              </GlassCard>
            </>
          )}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard hover={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      activeFilter === tab.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Applications List */}
        <StaggerContainer className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : null}
          {isError ? (
            <GlassCard className="p-6">
              <p className="text-sm text-muted-foreground">
                Failed to load applications{error instanceof Error ? `: ${error.message}` : "."}
              </p>
            </GlassCard>
          ) : null}

          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
          {!isLoading && applications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No applications found matching your criteria.</p>
            </motion.div>
          )}
        </StaggerContainer>
      </div>
    </DashboardLayout>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const status = statusConfig[application.status];
  const job = application.job;

  const formatApplied = (applied: string) => {
    const d = new Date(applied);
    if (Number.isNaN(d.getTime())) return applied;
    return d.toLocaleDateString();
  };

  return (
    <StaggerItem>
      <Link to={`/jobs/${application.jobId}`}>
        <GlassCard className="p-6 hover:border-primary/50 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Job Info */}
            <div className="flex items-start gap-4 flex-1">
              <CompanyLogo
                logo={job?.logo}
                alt={job?.company ? `${job.company} logo` : "Company logo"}
                className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{job?.title || "Job"}</h3>
                    <p className="text-muted-foreground">{job?.company || ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job?.location || ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job?.type || ""}
                  </span>
                  <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                    {job?.salary || ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied {formatApplied(application.appliedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Match Score */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <Badge className="gradient-primary text-primary-foreground">
                {application.matchScore}% Match
              </Badge>
              
              <div className="flex items-center gap-2">
                {application.aiVerified && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    AI Verified
                  </Badge>
                )}
                {application.nftVerified && (
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    NFT Verified
                  </Badge>
                )}
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                <status.icon className={`h-4 w-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground hidden lg:block" />
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              {["Applied", "Reviewing", "Shortlisted", "Interview", "Offered"].map((step, index) => {
                const stepStatus = getStepStatus(application.status, index);
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        stepStatus === "completed"
                          ? "bg-success"
                          : stepStatus === "current"
                          ? "bg-primary animate-pulse"
                          : "bg-muted"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground mt-1 hidden md:block">{step}</span>
                    {index < 4 && (
                      <div
                        className={`absolute h-0.5 w-full ${
                          stepStatus === "completed" ? "bg-success" : "bg-muted"
                        }`}
                        style={{ left: "50%", top: "6px" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </Link>
    </StaggerItem>
  );
}

function getStepStatus(
  status: Application["status"],
  stepIndex: number
): "completed" | "current" | "pending" {
  const statusOrder = ["pending", "reviewing", "shortlisted", "interview", "offered"];
  const currentIndex = statusOrder.indexOf(status);
  
  if (status === "rejected") return "pending";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}
