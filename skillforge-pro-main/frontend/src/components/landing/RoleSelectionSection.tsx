import { motion } from "framer-motion";
import { ArrowRight, User, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { HoverCard } from "@/components/ui/animated-container";
import { useAuth } from "@/context/AuthContext";

const roles = [
  {
    id: "candidate",
    title: "I'm a Candidate",
    description: "Find your dream job, showcase your verified skills, and build your on-chain reputation.",
    icon: User,
    features: [
      "AI-powered skill scoring",
      "NFT certificate minting",
      "Track applications",
      "Build reputation",
    ],
    href: "/auth?role=candidate",
    gradient: "from-primary to-primary/60",
  },
  {
    id: "recruiter",
    title: "I'm a Recruiter",
    description: "Find verified talent, post jobs with smart matching, and build trusted hiring pipelines.",
    icon: Building2,
    features: [
      "Post verified job listings",
      "AI-ranked candidates",
      "Blockchain verification",
      "DAO trust scores",
    ],
    href: "/auth?role=recruiter",
    gradient: "from-accent to-accent/60",
  },
];

export function RoleSelectionSection() {
  const { isAuthenticated } = useAuth();

  // Hide this section if user is already logged in
  if (isAuthenticated) {
    return null;
  }
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Get Started <span className="gradient-text">Today</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your path and join the decentralized hiring revolution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <HoverCard className="h-full">
                <Link
                  to={role.href}
                  className="group block h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-glow"
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${role.gradient} mb-6`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-display text-2xl font-bold mb-3">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </HoverCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
