import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { monthlyRegistrations, skillsVerification, verificationRatio, revenueData } from "@/lib/mockData";

const chartContainer = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm text-muted-foreground">
          {entry.name}: <span className="font-semibold text-foreground">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export function UserRegistrationsChart() {
  return (
    <motion.div variants={chartContainer} initial="initial" animate="animate" transition={{ delay: 0.6 }}
      className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-base font-semibold text-foreground">Monthly User Registrations</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={monthlyRegistrations}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
          <XAxis dataKey="month" stroke="hsl(215, 16%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 16%, 55%)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="users" stroke="hsl(200, 95%, 55%)" strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(200, 95%, 55%)" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function SkillsVerificationChart() {
  return (
    <motion.div variants={chartContainer} initial="initial" animate="animate" transition={{ delay: 0.7 }}
      className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-base font-semibold text-foreground">Skills Verification by Category</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={skillsVerification}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
          <XAxis dataKey="skill" stroke="hsl(215, 16%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 16%, 55%)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="verified" fill="hsl(200, 95%, 55%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function VerificationRatioChart() {
  return (
    <motion.div variants={chartContainer} initial="initial" animate="animate" transition={{ delay: 0.8 }}
      className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-base font-semibold text-foreground">Verification Status</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={verificationRatio} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
            paddingAngle={4} dataKey="value" strokeWidth={0}>
            {verificationRatio.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function RevenueChart() {
  return (
    <motion.div variants={chartContainer} initial="initial" animate="animate" transition={{ delay: 0.9 }}
      className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-base font-semibold text-foreground">Revenue Growth</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
          <XAxis dataKey="month" stroke="hsl(215, 16%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 16%, 55%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="hsl(160, 84%, 44%)" strokeWidth={2.5}
            fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
