import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Fuel, Activity, Clock } from "lucide-react";
import { nftData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SkeletonCard, { SkeletonTable } from "@/components/dashboard/SkeletonCard";

const nftStats = [
  { label: "Total Minted", value: nftData.totalMinted.toLocaleString(), icon: Award, gradient: "gradient-card-1" },
  { label: "Pending Mints", value: nftData.pendingMints.toString(), icon: Clock, gradient: "gradient-card-3" },
  { label: "Blockchain", value: nftData.blockchainStatus, icon: Activity, gradient: "gradient-card-2" },
  { label: "Avg Gas Fee", value: nftData.avgGasFee, icon: Fuel, gradient: "gradient-card-4" },
];

export default function NFTPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t); }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">NFT Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage blockchain-verified skill certificates</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) :
          nftStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border border-border bg-card p-6 ${s.gradient}`}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2"><s.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {loading ? <SkeletonTable /> : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-base font-semibold text-foreground">Recent Certificates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Token ID</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Skill</th>
                  <th className="px-4 py-3 font-medium">Minted At</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {nftData.certificates.map((c) => (
                  <motion.tr key={c.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }} className="border-b border-border">
                    <td className="px-4 py-3 font-mono text-foreground">{c.tokenId}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{c.user}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.skill}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.mintedAt}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === "minted" ? "bg-accent/10 text-accent" : c.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.txHash}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
