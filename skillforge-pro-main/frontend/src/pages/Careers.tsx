import { motion } from "framer-motion";
import { Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <p className="text-sm uppercase tracking-widest text-primary">Careers</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Help build the future of verified hiring.
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We&apos;re a small, product-focused team working on AI, Web3, and better hiring
              experiences. This page is a placeholder for future open roles.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-1">
                    No open roles just yet.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll share product, engineering, and design roles here once we&apos;re hiring.
                    In the meantime, you can still explore the product.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Link to="/jobs">
                  <GradientButton>
                    Explore Jobs
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </Link>
                <p className="text-xs text-muted-foreground">
                  This is demo content for the careers page.
                </p>
              </div>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;

