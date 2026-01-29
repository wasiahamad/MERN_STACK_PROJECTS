import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  ChevronDown,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { mockCandidates, Candidate } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { id: "all", label: "All Candidates" },
  { id: "new", label: "New" },
  { id: "reviewed", label: "Reviewed" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
];

const statusConfig = {
  new: { color: "bg-muted text-muted-foreground", label: "New" },
  reviewed: { color: "bg-primary/10 text-primary", label: "Reviewed" },
  shortlisted: { color: "bg-accent/10 text-accent", label: "Shortlisted" },
  interview: { color: "bg-warning/10 text-warning", label: "Interview" },
  offered: { color: "bg-success/10 text-success", label: "Offered" },
  rejected: { color: "bg-destructive/10 text-destructive", label: "Rejected" },
};

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Candidate status changed to ${newStatus}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Candidates</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage job applicants
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            { label: "Total", count: mockCandidates.length, color: "bg-muted" },
            { label: "New", count: mockCandidates.filter((c) => c.status === "new").length, color: "bg-primary/10" },
            { label: "Shortlisted", count: mockCandidates.filter((c) => c.status === "shortlisted").length, color: "bg-accent/10" },
            { label: "Interview", count: mockCandidates.filter((c) => c.status === "interview").length, color: "bg-warning/10" },
            { label: "Offered", count: mockCandidates.filter((c) => c.status === "offered").length, color: "bg-success/10" },
          ].map((stat) => (
            <GlassCard key={stat.label} hover={false} className="p-3 text-center">
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard hover={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      statusFilter === status.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Candidates List */}
        <StaggerContainer className="space-y-4">
          {filteredCandidates
            .sort((a, b) => b.matchScore - a.matchScore)
            .map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              onStatusChange={handleStatusChange}
              onSelect={() => setSelectedCandidate(candidate)}
            />
          ))}
        </StaggerContainer>

        {filteredCandidates.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">No candidates found.</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CandidateCard({
  candidate,
  rank,
  onStatusChange,
  onSelect,
}: {
  candidate: Candidate;
  rank: number;
  onStatusChange: (id: string, status: string) => void;
  onSelect: () => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const status = statusConfig[candidate.status];

  const avatarSrc = (() => {
    const a = (candidate.avatar || "").trim();
    if (!a) return "";
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
    return "";
  })();

  const avatarFallback = (() => {
    const a = (candidate.avatar || "").trim();
    if (a && !a.startsWith("http") && !a.startsWith("/uploads")) return a;
    const name = (candidate.name || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "👤";
  })();

  return (
    <StaggerItem>
      <GlassCard className="p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Avatar & Rank */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden flex items-center justify-center text-2xl">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  avatarFallback
                )}
              </div>
              {rank <= 3 && (
                <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-warning flex items-center justify-center">
                  <Star className="h-3 w-3 text-warning-foreground fill-current" />
                </div>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-semibold text-lg">{candidate.name}</h3>
                <p className="text-muted-foreground">{candidate.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gradient-primary text-primary-foreground">
                  {candidate.matchScore}% Match
                </Badge>
                <div className="relative">
                  <button
                    onClick={() => setStatusOpen(!statusOpen)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.color}`}
                  >
                    {status.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10">
                      {Object.entries(statusConfig).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => {
                            onStatusChange(candidate.id, key);
                            setStatusOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted capitalize"
                        >
                          {value.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{candidate.location}</span>
              <span>{candidate.experience} experience</span>
              <span>Applied {candidate.appliedDate}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Scores */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">AI Score: <strong>{candidate.aiScore}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-sm">Reputation: <strong>{candidate.reputation}</strong></span>
              </div>
              {candidate.nftCertificates.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">{candidate.nftCertificates.length} NFT Certs</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2 shrink-0">
            <GradientButton size="sm" onClick={onSelect}>
              <Eye className="h-4 w-4" />
              View Profile
            </GradientButton>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>
      </GlassCard>
    </StaggerItem>
  );
}
