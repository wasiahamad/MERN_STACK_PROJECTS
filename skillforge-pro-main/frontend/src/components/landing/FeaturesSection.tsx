import { motion } from "framer-motion";
import { Shield, Cpu, Users, Award, Wallet, Vote } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";

const features = [
  {
    icon: Cpu,
    title: "AI Skill Scoring",
    description: "Get your skills evaluated by our advanced AI engine. Receive a score from 0-100 based on your experience, projects, and certifications.",
    color: "text-primary",
  },
  {
    icon: Award,
    title: "NFT Certificates",
    description: "Mint your certificates as NFTs on the blockchain. Prove your qualifications with immutable, verifiable credentials.",
    color: "text-accent",
  },
  {
    icon: Shield,
    title: "On-Chain Verification",
    description: "All verifications are stored on the blockchain. Recruiters can instantly verify your skills and credentials.",
    color: "text-success",
  },
  {
    icon: Wallet,
    title: "Wallet Authentication",
    description: "Connect with your crypto wallet. No passwords needed, just secure blockchain-based authentication.",
    color: "text-warning",
  },
  {
    icon: Vote,
    title: "DAO Governance",
    description: "Participate in platform governance. Vote on proposals, moderate recruiters, and shape the future of hiring.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Reputation System",
    description: "Build your on-chain reputation. Both candidates and recruiters earn trust scores based on their platform activity.",
    color: "text-accent",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">ChainHire</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the next evolution of hiring with blockchain security, AI intelligence, and decentralized governance.
          </p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <StaggerItem key={feature.title}>
              <GlassCard className="h-full">
                <div className={`mb-4 inline-flex p-3 rounded-xl bg-muted ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
