import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { monetizationData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonCard, { SkeletonChart } from "@/components/dashboard/SkeletonCard";
import { TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["hsl(200, 95%, 55%)", "hsl(160, 84%, 44%)", "hsl(38, 92%, 50%)", "hsl(250, 85%, 60%)"];

export default function MonetizationPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t); }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Monetization</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue streams and subscription analytics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) :
          monetizationData.stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${s.trend === "up" ? "text-accent" : "text-destructive"}`}>
                {s.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {s.change}
              </div>
            </motion.div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? <><SkeletonChart /><SkeletonChart /></> : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-6 text-base font-semibold text-foreground">Revenue by Source</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={monetizationData.revenueBySource} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                    paddingAngle={4} dataKey="value" nameKey="source" strokeWidth={0}>
                    {monetizationData.revenueBySource.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {monetizationData.revenueBySource.map((s, i) => (
                  <div key={s.source} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{s.source}: <span className="font-medium text-foreground">{s.amount}</span></span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Subscription Plans</h3>
              <div className="space-y-4">
                {monetizationData.plans.map((plan) => (
                  <div key={plan.name} className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">{plan.users.toLocaleString()} users</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(plan.users / 12400) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full bg-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Revenue: ₹{plan.revenue.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
