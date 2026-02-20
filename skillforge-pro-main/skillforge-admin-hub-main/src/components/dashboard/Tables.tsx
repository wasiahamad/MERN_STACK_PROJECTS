import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { usersTableData, recruitersTableData } from "@/lib/mockData";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const filtered = usersTableData.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
      className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">Users</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Skills Verified</th>
              <th className="px-4 py-3 font-medium">Accuracy</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <motion.tr key={user.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                className="border-b border-border transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-foreground">{user.skillsVerified}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${user.accuracy >= 90 ? "text-accent" : user.accuracy >= 75 ? "text-warning" : "text-destructive"}`}>
                    {user.accuracy}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.status === "active" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">{filtered.length} results</span>
        <div className="flex gap-1">
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

export function RecruitersTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
      className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">Recruiters</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Active Jobs</th>
              <th className="px-4 py-3 font-medium">Hires</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recruitersTableData.map((r) => (
              <motion.tr key={r.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                className="border-b border-border transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{r.company}</td>
                <td className="px-4 py-3 text-foreground">{r.activeJobs}</td>
                <td className="px-4 py-3 text-foreground">{r.hires}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
