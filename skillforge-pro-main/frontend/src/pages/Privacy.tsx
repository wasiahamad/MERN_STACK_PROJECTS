import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";

const Privacy = () => {
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
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-sm uppercase tracking-widest text-primary">Privacy Policy</p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              How we handle your data (demo copy).
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              This is a placeholder privacy policy page. Replace this text with your real policy
              once legal content is available.
            </p>
          </motion.section>

          <GlassCard className="p-6 md:p-8 space-y-4">
            <h2 className="font-display text-xl font-semibold">Important notes</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>
                The current demo does not persist real user data or blockchain transactions.
              </li>
              <li>
                When you introduce a backend, document what personal data is stored, for how long,
                and for what purpose.
              </li>
              <li>
                Explain how candidates and recruiters can request data export or deletion.
              </li>
            </ul>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;

