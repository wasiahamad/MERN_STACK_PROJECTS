import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

const placeholderPosts = [
  {
    id: "1",
    title: "Why verified credentials matter in hiring",
    category: "Product",
    readTime: "6 min read",
    date: "Coming soon",
  },
  {
    id: "2",
    title: "Using AI scores to improve candidate screening",
    category: "AI & Data",
    readTime: "5 min read",
    date: "Coming soon",
  },
  {
    id: "3",
    title: "NFT certificates for skills and education",
    category: "Web3",
    readTime: "7 min read",
    date: "Coming soon",
  },
];

const Blog = () => {
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
            <p className="text-sm uppercase tracking-widest text-primary">Blog</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Insights on AI, Web3, and hiring.
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              This page lists placeholder articles. When a real backend exists, it can be backed
              by a posts API.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {placeholderPosts.map((post) => (
              <GlassCard key={post.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{post.category}</Badge>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold">{post.title}</h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Blog content will be served from the backend in the future. For now, this card
                  shows the kind of metadata your posts API should provide.
                </p>
              </GlassCard>
            ))}
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;

