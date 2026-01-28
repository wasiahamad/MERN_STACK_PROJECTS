import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-sm uppercase tracking-widest text-primary">Terms of Service</p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Demo terms for the ChainHire UI.
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              This is a non-binding placeholder. Replace with your own legal terms covering
              candidates, recruiters, and DAO participation.
            </p>
          </motion.section>

          <GlassCard className="p-6 md:p-8 space-y-4">
            <h2 className="font-display text-xl font-semibold">Suggested sections</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Account responsibilities for candidates and recruiters</li>
              <li>Acceptable use of the platform and content</li>
              <li>Liability and warranty disclaimers</li>
              <li>Governing law and dispute resolution</li>
            </ul>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

