import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardStats } from "@/lib/mockData";
import StatCard from "@/components/dashboard/StatCard";
import SkeletonCard, { SkeletonChart, SkeletonTable } from "@/components/dashboard/SkeletonCard";
import {
  UserRegistrationsChart,
  SkillsVerificationChart,
  VerificationRatioChart,
  RevenueChart,
} from "@/components/dashboard/Charts";
import { UsersTable, RecruitersTable } from "@/components/dashboard/Tables";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      {/* Page header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your SkillForge platform</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : dashboardStats.map((stat, i) => <StatCard key={stat.id} {...stat} index={i} />)}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <UserRegistrationsChart />
            <SkillsVerificationChart />
            <VerificationRatioChart />
            <RevenueChart />
          </>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? (
          <>
            <SkeletonTable />
            <SkeletonTable />
          </>
        ) : (
          <>
            <UsersTable />
            <RecruitersTable />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
