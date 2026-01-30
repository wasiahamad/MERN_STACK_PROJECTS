import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Clock, IndianRupee, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCardSkeleton } from "@/components/ui/skeleton-loader";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { usePublicJobs } from "@/lib/apiHooks";
import type { Job } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { CompanyLogo } from "@/components/ui/company-logo";

const Jobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [experienceQuery, setExperienceQuery] = useState("");
  const [salaryMinQuery, setSalaryMinQuery] = useState("");
  const [salaryMaxQuery, setSalaryMaxQuery] = useState("");
  const [skillsQuery, setSkillsQuery] = useState("");
  const [sortQuery, setSortQuery] = useState<"newest" | "oldest">("newest");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedExperience, setAppliedExperience] = useState("");
  const [appliedSalaryMin, setAppliedSalaryMin] = useState<number | undefined>(undefined);
  const [appliedSalaryMax, setAppliedSalaryMax] = useState<number | undefined>(undefined);
  const [appliedSkills, setAppliedSkills] = useState<string[]>([]);
  const [appliedSort, setAppliedSort] = useState<"newest" | "oldest">("newest");

  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);

  const parseSkills = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const parseNumberOrUndefined = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  };

  const queryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      location: appliedLocation || undefined,
      type: appliedType || undefined,
      experience: appliedExperience || undefined,
      salaryMin: appliedSalaryMin,
      salaryMax: appliedSalaryMax,
      skills: appliedSkills.length ? appliedSkills : undefined,
      sort: appliedSort,
      page,
      pageSize: 10,
    }),
    [
      appliedSearch,
      appliedLocation,
      appliedType,
      appliedExperience,
      appliedSalaryMin,
      appliedSalaryMax,
      appliedSkills,
      appliedSort,
      page,
    ]
  );

  const { data, isLoading, isFetching, isError, error } = usePublicJobs(queryParams);

  useEffect(() => {
    setPage(1);
    setJobs([]);
  }, [appliedSearch, appliedLocation, appliedType, appliedExperience, appliedSalaryMin, appliedSalaryMax, appliedSkills, appliedSort]);

  useEffect(() => {
    if (!data?.items) return;
    setJobs((prev) => {
      if (page <= 1) return data.items;
      const seen = new Set(prev.map((j) => j.id));
      const next = data.items.filter((j) => !seen.has(j.id));
      return [...prev, ...next];
    });
  }, [data?.items, page]);

  const total = data?.total ?? jobs.length;
  const canLoadMore = jobs.length < total;

  const formatPosted = (posted: string) => {
    const d = new Date(posted);
    if (Number.isNaN(d.getTime())) return posted;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Find Your <span className="gradient-text">Dream Job</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover verified opportunities from trusted companies with blockchain-verified credentials.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard hover={false} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Job title, skills, or company..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Location or Remote"
                    className="pl-10 h-12"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
                <GradientButton
                  size="lg"
                  className="h-12 px-8"
                  onClick={() => {
                    setAppliedSearch(searchQuery.trim());
                    setAppliedLocation(locationQuery.trim());
                    setAppliedType(typeQuery);
                    setAppliedExperience(experienceQuery.trim());
                    setAppliedSalaryMin(parseNumberOrUndefined(salaryMinQuery));
                    setAppliedSalaryMax(parseNumberOrUndefined(salaryMaxQuery));
                    setAppliedSkills(parseSkills(skillsQuery));
                    setAppliedSort(sortQuery);
                  }}
                >
                  <Search className="h-5 w-5" />
                  Search
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard hover={false} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground">Job Type</label>
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={typeQuery}
                    onChange={(e) => setTypeQuery(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground">Experience</label>
                  <Input
                    className="mt-1 h-11"
                    placeholder="e.g. 2+ years"
                    value={experienceQuery}
                    onChange={(e) => setExperienceQuery(e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground">Salary Min (₹)</label>
                  <Input
                    className="mt-1 h-11"
                    inputMode="numeric"
                    placeholder="e.g. 500000"
                    value={salaryMinQuery}
                    onChange={(e) => setSalaryMinQuery(e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground">Salary Max (₹)</label>
                  <Input
                    className="mt-1 h-11"
                    inputMode="numeric"
                    placeholder="e.g. 1500000"
                    value={salaryMaxQuery}
                    onChange={(e) => setSalaryMaxQuery(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Skills (comma separated)</label>
                  <Input
                    className="mt-1 h-11"
                    placeholder="React, TypeScript, Node"
                    value={skillsQuery}
                    onChange={(e) => setSkillsQuery(e.target.value)}
                  />
                </div>

                <div className="md:col-span-4 flex flex-wrap gap-3">
                  <GradientButton
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      setAppliedSearch(searchQuery.trim());
                      setAppliedLocation(locationQuery.trim());
                      setAppliedType(typeQuery);
                      setAppliedExperience(experienceQuery.trim());
                      setAppliedSalaryMin(parseNumberOrUndefined(salaryMinQuery));
                      setAppliedSalaryMax(parseNumberOrUndefined(salaryMaxQuery));
                      setAppliedSkills(parseSkills(skillsQuery));
                      setAppliedSort(sortQuery);
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </GradientButton>

                  <GradientButton
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      setSearchQuery("");
                      setLocationQuery("");
                      setTypeQuery("");
                      setExperienceQuery("");
                      setSalaryMinQuery("");
                      setSalaryMaxQuery("");
                      setSkillsQuery("");
                      setSortQuery("newest");

                      setAppliedSearch("");
                      setAppliedLocation("");
                      setAppliedType("");
                      setAppliedExperience("");
                      setAppliedSalaryMin(undefined);
                      setAppliedSalaryMax(undefined);
                      setAppliedSkills([]);
                      setAppliedSort("newest");
                    }}
                  >
                    Clear
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{jobs.length}</span> jobs
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={sortQuery}
                onChange={(e) => {
                  const next = (e.target.value as "newest" | "oldest") || "newest";
                  setSortQuery(next);
                  setAppliedSort(next);
                }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </motion.div>

          {/* Job Listings */}
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid gap-4">
              {isError ? (
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    Failed to load jobs{error instanceof Error ? `: ${error.message}` : "."}
                  </p>
                </div>
              ) : null}
              {jobs.map((job) => (
                <StaggerItem key={job.id}>
                  <HoverCard>
                    <div
                      className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Logo */}
                        <CompanyLogo
                          logo={job.logo}
                          alt={job.company ? `${job.company} logo` : "Company logo"}
                          className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl shrink-0"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-display text-lg font-semibold hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-muted-foreground">{job.company}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {job.verified && (
                                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                  Verified
                                </Badge>
                              )}
                              {typeof job.matchScore === "number" ? (
                                <Badge className="gradient-primary text-primary-foreground">{job.matchScore}% Match</Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatPosted(job.posted)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Apply Button */}
                        <div className="shrink-0">
                          <GradientButton
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/jobs/${job.id}`);
                            }}
                          >
                            Apply Now
                          </GradientButton>
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <GradientButton
              variant="outline"
              size="lg"
              disabled={!canLoadMore || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Load More Jobs
            </GradientButton>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
