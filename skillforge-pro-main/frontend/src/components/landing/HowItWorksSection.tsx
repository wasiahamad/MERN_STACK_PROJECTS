import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAuth } from "@/context/AuthContext";

const steps = [
  {
    step: "01",
    title: "Connect Wallet",
    description: "Link your crypto wallet for secure, password-free authentication.",
  },
  {
    step: "02",
    title: "Build Profile",
    description: "Add your skills, experience, and upload certificates to mint as NFTs.",
  },
  {
    step: "03",
    title: "Get AI Score",
    description: "Our AI analyzes your profile and provides a skill score from 0-100.",
  },
  {
    step: "04",
    title: "Apply & Verify",
    description: "Apply to jobs with instant blockchain verification of your credentials.",
  },
];

export function HowItWorksSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartJourney = () => {
    navigate("/auth");
  };
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-dark opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to revolutionize your hiring or job search experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4" />
              )}
              
              <div className="glass rounded-2xl p-6 h-full">
                <div className="text-5xl font-display font-bold gradient-text mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <GradientButton size="lg" className="group" onClick={handleStartJourney}>
              Start Your Journey
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </GradientButton>
          </motion.div>
        )}
      </div>
    </section>
  );
}
