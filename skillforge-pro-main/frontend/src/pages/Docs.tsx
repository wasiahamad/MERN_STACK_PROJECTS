import { motion } from "framer-motion";
import { BookOpen, Code2, Server } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";

const Docs = () => {
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
            <p className="text-sm uppercase tracking-widest text-primary">Documentation</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              API & integration docs (placeholder).
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Use this page to host developer documentation for ChainHire once the backend
              and public APIs are implemented.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard className="p-6 space-y-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">Overview</h2>
              <p className="text-sm text-muted-foreground">
                High-level guides for how candidates, recruiters, and the DAO interact with the
                platform.
              </p>
            </GlassCard>
            <GlassCard className="p-6 space-y-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">Frontend → Backend</h2>
              <p className="text-sm text-muted-foreground">
                See `FRONTEND_BACKEND_API_DOCUMENTATION.md` in the repo for the current contract
                between UI and API.
              </p>
            </GlassCard>
            <GlassCard className="p-6 space-y-2">
              <Server className="h-6 w-6 text-primary" />
              <h2 className="font-display text-lg font-semibold">API Reference</h2>
              <p className="text-sm text-muted-foreground">
                In a real deployment, this card would link to an OpenAPI/Swagger or similar
                interactive reference.
              </p>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;

