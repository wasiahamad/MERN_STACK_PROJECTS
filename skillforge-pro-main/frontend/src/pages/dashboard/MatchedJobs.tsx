import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CompanyLogo } from "@/components/ui/company-logo";
import { CardSkeleton } from "@/components/ui/skeleton-loader";
import { useMatchedJobs } from "@/lib/apiHooks";

export default function MatchedJobs() {
  const minScore = 60;
  const matchedQuery = useMatchedJobs({ minScore, page: 1, pageSize: 50 });

  const loading = matchedQuery.isLoading;
  const items = matchedQuery.data?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Matched Jobs</h1>
            <p className="text-sm text-muted-foreground">Jobs matching your verified skills (≥ {minScore}%).</p>
          </div>
          <Link to="/jobs">
            <GradientButton variant="outline">Browse all jobs</GradientButton>
          </Link>
        </motion.div>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Only jobs with match ≥ {minScore}% appear here. To apply, you must keep the same minimum match and have verified skills.</div>
          </div>
        </GlassCard>

        {matchedQuery.isError ? (
          <GlassCard className="p-6">
            <p className="text-sm text-muted-foreground">Failed to load matched jobs.</p>
          </GlassCard>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : items.length
            ? items.map((job) => (
                <GlassCard key={job.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <CompanyLogo
                      logo={job.logo}
                      alt={job.company ? `${job.company} logo` : "Company logo"}
                      className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display font-semibold truncate">{job.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                        </div>
                        <Badge className="gradient-primary text-primary-foreground shrink-0">{job.matchScore ?? 0}% Match</Badge>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>{job.salary || "Not disclosed"}</span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Matched skills</p>
                          <div className="flex flex-wrap gap-2">
                            {(job as any).matchedSkills?.length ? (
                              (job as any).matchedSkills.map((s: string) => (
                                <Badge key={`m-${job.id}-${s}`} variant="secondary" className="bg-success/10 text-success border-success/20">
                                  {s}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Missing skills</p>
                          <div className="flex flex-wrap gap-2">
                            {(job as any).missingSkills?.length ? (
                              (job as any).missingSkills.slice(0, 6).map((s: string) => (
                                <Badge key={`x-${job.id}-${s}`} variant="outline">
                                  {s}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <Link to={`/jobs/${job.id}`} className="flex-1">
                          <GradientButton className="w-full">View job</GradientButton>
                        </Link>
                        <Link to={`/assessment/${encodeURIComponent(((job as any).missingSkills?.[0] as string) || "")}`}>
                          <GradientButton variant="outline">Verify skill</GradientButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))
            : (
              <GlassCard className="p-6">
                <p className="text-sm text-muted-foreground">
                  No jobs match your verified skills yet. Verify more skills from your Profile to unlock better matches.
                </p>
              </GlassCard>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
