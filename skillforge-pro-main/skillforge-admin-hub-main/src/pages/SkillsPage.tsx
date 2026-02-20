import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, DollarSign, Tag, Plus, Percent } from "lucide-react";
import { skillsData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SkeletonTable } from "@/components/dashboard/SkeletonCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SkillsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState(skillsData);
  const [showOffer, setShowOffer] = useState(false);
  const [offerSkillId, setOfferSkillId] = useState<number | null>(null);
  const [offerForm, setOfferForm] = useState({ discount: 20, label: "" });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filtered = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  const handleCreateOffer = () => {
    if (offerSkillId === null) return;
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === offerSkillId) {
          const discountedPrice = Math.round(s.originalPrice * (1 - offerForm.discount / 100));
          return { ...s, price: discountedPrice, hasOffer: true, offerLabel: offerForm.label || `${offerForm.discount}% OFF` };
        }
        return s;
      })
    );
    setShowOffer(false);
    setOfferForm({ discount: 20, label: "" });
    setOfferSkillId(null);
  };

  const removeOffer = (id: number) => {
    setSkills((prev) => prev.map((s) => s.id === id ? { ...s, price: s.originalPrice, hasOffer: false, offerLabel: "" } : s));
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skills</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage skills, pricing, and offers</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Zap className="h-4 w-4" /> Add Skill
          </button>
        </div>
      </motion.div>

      {/* Create Offer Dialog */}
      <Dialog open={showOffer} onOpenChange={setShowOffer}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Offer</DialogTitle>
            <DialogDescription>Set discount for {skills.find((s) => s.id === offerSkillId)?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Discount %</label>
              <input type="number" value={offerForm.discount} onChange={(e) => setOfferForm({ ...offerForm, discount: +e.target.value })} min={1} max={90}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Offer Label (optional)</label>
              <input value={offerForm.label} onChange={(e) => setOfferForm({ ...offerForm, label: e.target.value })} placeholder="e.g. Summer Sale"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={handleCreateOffer} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Apply Offer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <SkeletonTable /> : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-base font-semibold text-foreground">All Skills ({filtered.length})</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills..."
                className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Skill</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Tests Taken</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Pass Rate</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Offer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((skill) => (
                  <motion.tr key={skill.id} whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }} className="border-b border-border transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{skill.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{skill.category}</td>
                    <td className="px-4 py-3 text-foreground">{skill.tests.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{skill.verified.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`font-medium ${skill.passRate >= 85 ? "text-accent" : "text-warning"}`}>{skill.passRate}%</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">₹{skill.price}</span>
                        {skill.hasOffer && skill.price !== skill.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{skill.originalPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {skill.hasOffer ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{skill.offerLabel}</span>
                          <button onClick={() => removeOffer(skill.id)} className="text-xs text-destructive hover:underline">Remove</button>
                        </div>
                      ) : (
                        <button onClick={() => { setOfferSkillId(skill.id); setShowOffer(true); }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Tag className="h-3 w-3" /> Add Offer
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${skill.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{skill.status}</span>
                    </td>
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
