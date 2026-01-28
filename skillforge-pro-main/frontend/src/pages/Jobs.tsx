import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Clock, DollarSign, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCardSkeleton } from "@/components/ui/skeleton-loader";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";

// Mock data
const mockJobs = [
  {
    id: 1,
    title: "Senior Blockchain Developer",
    company: "ChainTech Labs",
    logo: "🔗",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $180k",
    posted: "2 days ago",
    skills: ["Solidity", "Web3.js", "React", "Node.js"],
    matchScore: 95,
    verified: true,
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    company: "Neural Networks Inc",
    logo: "🧠",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150k - $200k",
    posted: "1 day ago",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
    matchScore: 88,
    verified: true,
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Web3 Ventures",
    logo: "🚀",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $140k",
    posted: "3 days ago",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    matchScore: 82,
    verified: false,
  },
  {
    id: 4,
    title: "Smart Contract Auditor",
    company: "SecureChain",
    logo: "🔒",
    location: "Remote",
    type: "Contract",
    salary: "$150k - $200k",
    posted: "5 hours ago",
    skills: ["Solidity", "Vyper", "Security", "Audit"],
    matchScore: 78,
    verified: true,
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudScale",
    logo: "☁️",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    posted: "1 week ago",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
    matchScore: 75,
    verified: true,
  },
];

const Jobs = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
                  <Input placeholder="Location or Remote" className="pl-10 h-12" />
                </div>
                <GradientButton size="lg" className="h-12 px-8">
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
            className="flex flex-wrap gap-3 mb-8"
          >
            {["Job Type", "Experience", "Salary Range", "Skills", "Verified Only"].map((filter) => (
              <button
                key={filter}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary/50 transition-colors"
              >
                {filter}
                <ChevronDown className="h-4 w-4" />
              </button>
            ))}
            <button className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Filter className="h-4 w-4" />
              Clear Filters
            </button>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{mockJobs.length}</span> jobs
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <button className="inline-flex items-center gap-1 text-sm font-medium">
                Relevance
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Job Listings */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid gap-4">
              {mockJobs.map((job) => (
                <StaggerItem key={job.id}>
                  <HoverCard>
                    <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Logo */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl shrink-0">
                          {job.logo}
                        </div>

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
                              <Badge className="gradient-primary text-primary-foreground">
                                {job.matchScore}% Match
                              </Badge>
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
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.posted}
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
                          <GradientButton size="sm">
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
            <GradientButton variant="outline" size="lg">
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
