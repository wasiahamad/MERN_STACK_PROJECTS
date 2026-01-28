import { motion } from "framer-motion";
import { Award, Globe, Shield, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";

const pillars = [
  {
    title: "Trust, by design",
    description: "Credentials and certificates can be verified, helping reduce résumé fraud and improve hiring decisions.",
    icon: Shield,
  },
  {
    title: "Smarter matching",
    description: "AI scoring and structured signals highlight best-fit candidates for each role.",
    icon: Sparkles,
  },
  {
    title: "Community governance",
    description: "DAO-driven decisions align the platform with users, not gatekeepers.",
    icon: Globe,
  },
];

const values = [
  { title: "Transparency", description: "Make hiring signals verifiable and auditable.", icon: Award },
  { title: "Fair opportunity", description: "Let skills and proof-of-work speak louder than networks.", icon: Users },
];

const About = () => {
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
            className="space-y-6 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-primary">About ChainHire</p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
              Hiring should be <span className="gradient-text">verified</span>, fast, and fair.
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              ChainHire is a next-generation job platform that blends AI-powered matching with blockchain-verified
              credentials and decentralized governance.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/jobs">
                <GradientButton size="lg">Browse Jobs</GradientButton>
              </Link>
              <Link to="/recruiters">
                <GradientButton variant="outline" size="lg">
                  For Recruiters
                </GradientButton>
              </Link>
            </div>
          </motion.section>

          {/* Pillars */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl font-bold">What we’re building</h2>
              <p className="text-muted-foreground">A trusted marketplace for talent and opportunity.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillars.map((p) => (
                <GlassCard key={p.title} className="p-6 space-y-3">
                  <p.icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </GlassCard>
              ))}
            </div>
          </motion.section>

          {/* Values */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start"
          >
            <GlassCard className="p-6 lg:col-span-1 space-y-3">
              <h2 className="font-display text-2xl font-bold">Our values</h2>
              <p className="text-sm text-muted-foreground">
                We build with the belief that verified signals can unlock a more equitable hiring market.
              </p>
            </GlassCard>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((v) => (
                <GlassCard key={v.title} className="p-6 space-y-3">
                  <v.icon className="h-6 w-6 text-accent" />
                  <h3 className="font-semibold text-lg">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
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
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold">Want to learn more?</h3>
                <p className="text-muted-foreground">Reach out—we’d love to hear from you.</p>
              </div>
              <Link to="/contact">
                <GradientButton>Contact Us</GradientButton>
              </Link>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
