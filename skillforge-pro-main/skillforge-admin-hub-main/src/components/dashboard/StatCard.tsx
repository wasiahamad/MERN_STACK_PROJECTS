import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  ClipboardCheck,
  ShieldCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Briefcase,
  ClipboardCheck,
  ShieldCheck,
  DollarSign,
};

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  gradient: string;
  index: number;
}

export default function StatCard({ label, value, change, trend, icon, gradient, index }: StatCardProps) {
  const Icon = iconMap[icon] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 ${gradient}`}
    >
      {/* Glow effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`h-4 w-4 ${trend === "up" ? "text-accent" : "text-destructive"}`} />
            <span className={`text-sm font-medium ${trend === "up" ? "text-accent" : "text-destructive"}`}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
