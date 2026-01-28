import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Eye,
  CheckCircle,
  Share2,
  Bookmark,
  Building,
  Globe,
  Shield,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { mockJobs, mockCompanies, currentUser } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function JobDetail() {
  const { id } = useParams();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  const job = mockJobs.find((j) => j.id === id) || mockJobs[0];
  const company = mockCompanies.find((c) => c.name === job.company) || mockCompanies[0];

  const handleApply = async () => {
    setApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setApplying(false);
    setApplyModalOpen(false);
    toast({
      title: "Application Submitted! 🎉",
      description: "Your application has been sent successfully. Good luck!",
    });
  };

  // Calculate match details
  const skillMatch = Math.round(
    (job.skills.filter((s) => currentUser.skills?.some((us) => us.name === s)).length / job.skills.length) * 100
  );
  const certMatch = job.requiredCertificates.length === 0 || 
    job.requiredCertificates.every((c) => currentUser.certificates?.some((uc) => uc.name === c));
  const scoreMatch = (currentUser.aiScore || 0) >= job.minAiScore;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-4xl shrink-0">
                      {job.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start gap-3 mb-2">
                        <h1 className="font-display text-2xl md:text-3xl font-bold">{job.title}</h1>
                        {job.verified && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground">{job.company}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
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
                          Posted {job.posted}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicants} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views} views
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                    <GradientButton onClick={() => setApplyModalOpen(true)} size="lg">
                      Apply Now
                    </GradientButton>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setSaved(!saved);
                        toast({
                          title: saved ? "Removed from saved" : "Job Saved!",
                          description: saved ? "Job removed from your saved list" : "You can find it in your saved jobs",
                        });
                      }}
                    >
                      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                      {saved ? "Saved" : "Save Job"}
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard className="p-6 md:p-8">
                  <h2 className="font-display text-xl font-semibold mb-4">Job Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>

                  <h3 className="font-display text-lg font-semibold mt-6 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-display text-lg font-semibold mt-6 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => {
                      const hasSkill = currentUser.skills?.some((s) => s.name === skill);
                      return (
                        <Badge
                          key={skill}
                          variant={hasSkill ? "default" : "outline"}
                          className={hasSkill ? "bg-success/10 text-success border-success/20" : ""}
                        >
                          {hasSkill && <CheckCircle className="h-3 w-3 mr-1" />}
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>

                  {job.requiredCertificates.length > 0 && (
                    <>
                      <h3 className="font-display text-lg font-semibold mt-6 mb-3">Required Certificates</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredCertificates.map((cert) => {
                          const hasCert = currentUser.certificates?.some((c) => c.name === cert);
                          return (
                            <Badge
                              key={cert}
                              variant={hasCert ? "default" : "outline"}
                              className={hasCert ? "bg-primary/10 text-primary border-primary/20" : ""}
                            >
                              {hasCert && <Sparkles className="h-3 w-3 mr-1" />}
                              {cert}
                            </Badge>
                          );
                        })}
                      </div>
                    </>
                  )}
                </GlassCard>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Match Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Your Match Score</h3>
                  <div className="relative h-32 w-32 mx-auto mb-4">
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
                        stroke="url(#matchGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(job.matchScore || 0) * 3.52} 352`}
                      />
                      <defs>
                        <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(252, 85%, 60%)" />
                          <stop offset="100%" stopColor="hsl(172, 70%, 45%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-3xl font-bold">{job.matchScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skill Match</span>
                      <div className="flex items-center gap-2">
                        <Progress value={skillMatch} className="w-20 h-2" />
                        <span className="text-sm font-medium">{skillMatch}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Score ({job.minAiScore}+ required)</span>
                      <Badge variant={scoreMatch ? "default" : "destructive"} className={scoreMatch ? "bg-success/10 text-success border-success/20" : ""}>
                        {scoreMatch ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                        {currentUser.aiScore}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Certificate Match</span>
                      <Badge variant={certMatch ? "default" : "secondary"} className={certMatch ? "bg-success/10 text-success border-success/20" : ""}>
                        {certMatch ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                        {certMatch ? "Met" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">About the Company</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {company.logo}
                    </div>
                    <div>
                      <h4 className="font-semibold">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      {company.size}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {company.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={company.website} className="text-primary hover:underline">
                        {company.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Trust Score: <span className="text-success font-medium">{company.trustScore}%</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mt-4">{company.description}</p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{company.openJobs}</span> open positions
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setApplyModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Apply for {job.title}</h2>
                  <button
                    onClick={() => setApplyModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Application Summary */}
                  <div className="p-4 rounded-xl bg-muted">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-xl">
                        {job.logo}
                      </div>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Match Score</span>
                      <Badge className="gradient-primary text-primary-foreground">
                        {job.matchScore}%
                      </Badge>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Verification Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">AI Score: {currentUser.aiScore}/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Skills Verified on Blockchain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {certMatch ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className="text-sm">Required Certificates</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cover Letter (Optional)</label>
                    <Textarea
                      placeholder="Tell the recruiter why you're a great fit for this role..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setApplyModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <GradientButton
                      className="flex-1"
                      onClick={handleApply}
                      loading={applying}
                    >
                      {applying ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
