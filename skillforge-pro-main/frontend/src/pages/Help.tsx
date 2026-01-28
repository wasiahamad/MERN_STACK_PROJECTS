import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";

const Help = () => {
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
            <p className="text-sm uppercase tracking-widest text-primary">Help Center</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              How can we help?
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              This is a placeholder help center. In production, connect it to FAQs and support
              tickets from your backend.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard className="p-6 space-y-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">FAQs</h2>
              <p className="text-sm text-muted-foreground">
                Common questions about profiles, applications, and recruiter tools would be
                listed here.
              </p>
            </GlassCard>
            <GlassCard className="p-6 space-y-2">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">Email support</h2>
              <p className="text-sm text-muted-foreground">
                Back this section with an endpoint that routes messages to your support system.
              </p>
            </GlassCard>
            <GlassCard className="p-6 space-y-3 flex flex-col items-start">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">Still stuck?</h2>
              <p className="text-sm text-muted-foreground">
                Use the contact form to send us more details.
              </p>
              <GradientButton asChild>
                <a href="/contact">Go to Contact</a>
              </GradientButton>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;

