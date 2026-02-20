import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Building2, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Calendar, Globe, Users as UsersIcon, Briefcase } from "lucide-react";
import { recruitersTableData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SkeletonTable } from "@/components/dashboard/SkeletonCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RecruitersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState<typeof recruitersTableData[0] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filtered = recruitersTableData.filter((r) => r.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruiters</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage recruiter accounts and job postings</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Building2 className="h-4 w-4" /> Add Recruiter
          </button>
        </div>
      </motion.div>

      {/* Recruiter Detail Dialog */}
      <Dialog open={!!selectedRecruiter} onOpenChange={() => setSelectedRecruiter(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recruiter Details</DialogTitle>
          </DialogHeader>
          {selectedRecruiter && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {selectedRecruiter.company.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedRecruiter.company}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedRecruiter.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{selectedRecruiter.status}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedRecruiter.description}</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground"><UsersIcon className="h-4 w-4" />Contact: {selectedRecruiter.contactName}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Mail className="h-4 w-4" />{selectedRecruiter.email}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Phone className="h-4 w-4" />{selectedRecruiter.phone}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="h-4 w-4" />{selectedRecruiter.location}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Globe className="h-4 w-4" />{selectedRecruiter.website}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="h-4 w-4" />Joined {selectedRecruiter.joinedAt}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{selectedRecruiter.activeJobs}</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-accent">{selectedRecruiter.hires}</p>
                  <p className="text-xs text-muted-foreground">Total Hires</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{selectedRecruiter.employees}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{selectedRecruiter.industry}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? <SkeletonTable /> : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-base font-semibold text-foreground">All Recruiters ({filtered.length})</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recruiters..."
                className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Active Jobs</th>
                  <th className="px-4 py-3 font-medium">Hires</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <motion.tr key={r.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }} className="border-b border-border transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.company}</td>
                    <td className="px-4 py-3 text-foreground">{r.activeJobs}</td>
                    <td className="px-4 py-3 text-foreground">{r.hires}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${r.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedRecruiter(r)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
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
      )}
    </DashboardLayout>
  );
}
