import { motion } from "framer-motion";
import { CheckCircle, Shield, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";

const benefits = [
  {
    title: "Verified talent",
    description: "Candidate credentials, skills, and certificates are blockchain-verified to reduce fraud.",
    icon: Shield,
  },
  {
    title: "AI matching",
    description: "Smart matching surfaces best-fit candidates by skills, reputation, and role requirements.",
    icon: Sparkles,
  },
  {
    title: "Faster pipelines",
    description: "Prebuilt flows for screening, shortlisting, and scheduling keep you moving quickly.",
    icon: Zap,
  },
];

const steps = [
  "Post a role with required skills, salary, and certificates.",
  "Let AI scoring and NFT-verified credentials filter qualified talent.",
  "Review shortlists, message candidates, and schedule interviews.",
  "Hire with confidence and track reputation over time.",
];

const stats = [
  { label: "Verified candidates", value: "5k+", accent: "bg-primary/10 text-primary" },
  { label: "Avg. time-to-shortlist", value: "48h", accent: "bg-accent/10 text-accent" },
  { label: "Fraud reduction", value: "70%", accent: "bg-success/10 text-success" },
];

const Recruiters = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-14">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-widest text-primary">For recruiters</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Hire verified Web3 & AI talent with confidence.
              </h1>
              <p className="text-muted-foreground text-lg">
                ChainHire combines AI scoring with NFT-verified credentials to surface the most qualified candidates faster,
                reduce fraud, and keep your pipeline moving.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/recruiter/jobs/new">
                  <GradientButton size="lg">Post a Job</GradientButton>
                </Link>
                <Link to="/recruiter/candidates">
                  <GradientButton variant="outline" size="lg">
                    View Candidates
                  </GradientButton>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  KYC-ready workflows
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Team collaboration
                </div>
              </div>
            </div>
            <GlassCard className="p-6">
              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold">Why recruiters choose ChainHire</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-xl border border-border p-4 ${stat.accent} text-sm font-medium`}
                    >
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.section>

          {/* Benefits */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">Purpose-built for recruiters</h2>
              <p className="text-muted-foreground">
                Reduce screening time and increase trust with verified signals and automated scoring.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefits.map((benefit) => (
                <GlassCard key={benefit.title} className="p-5 space-y-3">
                  <benefit.icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </GlassCard>
              ))}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">How it works</h2>
              <p className="text-muted-foreground">From job post to offer, all in one workflow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <GlassCard key={step} className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </GlassCard>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold">Ready to meet verified talent?</h3>
                <p className="text-muted-foreground">
                  Post a role or import your openings to start receiving AI-ranked candidates.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/recruiter/jobs/new">
                  <GradientButton>Post a Job</GradientButton>
                </Link>
                <Link to="/recruiter/dashboard">
                  <GradientButton variant="outline">Go to Dashboard</GradientButton>
                </Link>
              </div>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Recruiters;
