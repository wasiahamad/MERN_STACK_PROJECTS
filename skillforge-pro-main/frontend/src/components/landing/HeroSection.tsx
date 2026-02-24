import { motion } from "framer-motion";
import { ArrowRight, Shield, Cpu, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { FloatingElement } from "@/components/ui/animated-container";
import { useAuth } from "@/context/AuthContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated, isRecruiter } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(isRecruiter ? "/recruiter/dashboard" : "/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleExploreJobs = () => {
    navigate("/jobs");
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Floating Elements */}
      <FloatingElement delay={0} className="absolute top-32 left-20 hidden lg:block">
        <div className="glass rounded-2xl p-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </FloatingElement>
      <FloatingElement delay={0.5} className="absolute top-48 right-32 hidden lg:block">
        <div className="glass rounded-2xl p-4">
          <Cpu className="h-8 w-8 text-accent" />
        </div>
      </FloatingElement>
      <FloatingElement delay={1} className="absolute bottom-32 left-32 hidden lg:block">
        <div className="glass rounded-2xl p-4">
          <Users className="h-8 w-8 text-success" />
        </div>
      </FloatingElement>
      <FloatingElement delay={1.5} className="absolute bottom-48 right-20 hidden lg:block">
        <div className="glass rounded-2xl p-4">
          <Sparkles className="h-8 w-8 text-warning" />
        </div>
      </FloatingElement>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Powered by Blockchain & AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            The Future of{" "}
            <span className="gradient-text">Hiring</span>
            <br />
            is Decentralized
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Connect with verified talent, prove your skills with NFT certificates,
            and participate in DAO governance. Welcome to ChainHire.
          </motion.p>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <GradientButton size="lg" className="group" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </GradientButton>
              <GradientButton variant="outline" size="lg" onClick={handleExploreJobs}>
                Explore Jobs
              </GradientButton>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { label: "Active Jobs", value: "10K+" },
              { label: "Verified Candidates", value: "50K+" },
              { label: "NFT Certificates", value: "25K+" },
              { label: "Companies", value: "22K+" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="glass rounded-2xl p-4"
              >
                <div className="font-display text-2xl md:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
