import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Ban, ChevronLeft, ChevronRight, UserPlus, MapPin, Phone, Mail, Calendar, Award, Star } from "lucide-react";
import { usersTableData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SkeletonTable } from "@/components/dashboard/SkeletonCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof usersTableData[0] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filtered = usersTableData.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage platform users and their skills</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedUser.status === "active" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{selectedUser.status}</span>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground"><Mail className="h-4 w-4" />{selectedUser.email}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Phone className="h-4 w-4" />{selectedUser.phone}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="h-4 w-4" />{selectedUser.location}</div>
                <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="h-4 w-4" />Joined {selectedUser.joinedAt}</div>
              </div>
              <p className="text-sm text-muted-foreground border-t border-border pt-3">{selectedUser.bio}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{selectedUser.skillsVerified}</p>
                  <p className="text-xs text-muted-foreground">Skills</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-accent">{selectedUser.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{selectedUser.assessmentsTaken}</p>
                  <p className="text-xs text-muted-foreground">Tests</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Rank: <span className="text-foreground">{selectedUser.rank}</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.topSkills.map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <SkeletonTable />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-base font-semibold text-foreground">All Users ({filtered.length})</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
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
                  <motion.tr key={user.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }} className="border-b border-border transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-foreground">{user.skillsVerified}</td>
                    <td className="px-4 py-3"><span className={`font-medium ${user.accuracy >= 90 ? "text-accent" : user.accuracy >= 75 ? "text-warning" : "text-destructive"}`}>{user.accuracy}%</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "active" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedUser(user)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
                        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Ban className="h-4 w-4" /></button>
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
      )}
    </DashboardLayout>
  );
}
