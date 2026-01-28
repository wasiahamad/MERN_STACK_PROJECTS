import { useState } from "react";
import { motion } from "framer-motion";
import {
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Plus,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { mockDAOProposals, DAOProposal, currentUser } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const statusConfig = {
  active: { color: "bg-primary/10 text-primary border-primary/20", label: "Active" },
  passed: { color: "bg-success/10 text-success border-success/20", label: "Passed" },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
  pending: { color: "bg-warning/10 text-warning border-warning/20", label: "Pending" },
};

const categoryConfig = {
  governance: { color: "bg-primary/10 text-primary", icon: Vote },
  feature: { color: "bg-accent/10 text-accent", icon: Plus },
  moderation: { color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  treasury: { color: "bg-warning/10 text-warning", icon: TrendingUp },
};

export default function DAO() {
  const [filter, setFilter] = useState<"all" | "active" | "passed" | "rejected" | "pending">("all");
  const [votedProposals, setVotedProposals] = useState<Record<string, "for" | "against">>({});

  const filteredProposals = mockDAOProposals.filter(
    (p) => filter === "all" || p.status === filter
  );

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    setVotedProposals((prev) => ({ ...prev, [proposalId]: vote }));
    toast({
      title: `Vote Submitted! ${vote === "for" ? "👍" : "👎"}`,
      description: `Your vote has been recorded on the blockchain.`,
    });
  };

  const totalVotingPower = currentUser.reputation || 0;
  const activeProposals = mockDAOProposals.filter((p) => p.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              DAO <span className="gradient-text">Governance</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Participate in platform decisions and earn reputation
            </p>
          </div>
          <GradientButton>
            <Plus className="h-4 w-4" />
            Create Proposal
          </GradientButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Vote className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{mockDAOProposals.length}</p>
            <p className="text-sm text-muted-foreground">Total Proposals</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{activeProposals}</p>
            <p className="text-sm text-muted-foreground">Active Votes</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">DAO Members</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{totalVotingPower}</p>
            <p className="text-sm text-muted-foreground">Your Voting Power</p>
          </GlassCard>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {["all", "active", "passed", "rejected", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                filter === status
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "all" ? "All Proposals" : status}
            </button>
          ))}
        </motion.div>

        {/* Proposals List */}
        <StaggerContainer className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              userVote={votedProposals[proposal.id]}
              onVote={(vote) => handleVote(proposal.id, vote)}
            />
          ))}
          {filteredProposals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No proposals found.</p>
            </motion.div>
          )}
        </StaggerContainer>
      </div>
    </DashboardLayout>
  );
}

function ProposalCard({
  proposal,
  userVote,
  onVote,
}: {
  proposal: DAOProposal;
  userVote?: "for" | "against";
  onVote: (vote: "for" | "against") => void;
}) {
  const status = statusConfig[proposal.status];
  const category = categoryConfig[proposal.category];
  const CategoryIcon = category.icon;
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;

  return (
    <StaggerItem>
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <Badge variant="outline" className={category.color}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {proposal.category}
              </Badge>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>

            <h3 className="font-display text-lg font-semibold mb-2">{proposal.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{proposal.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Proposed by: {proposal.proposer}</span>
              <span>Ends: {proposal.endDate}</span>
            </div>
          </div>

          {/* Voting Section */}
          <div className="lg:w-80 shrink-0">
            <div className="space-y-3">
              {/* Vote Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUp className="h-4 w-4" />
                    For: {proposal.votesFor.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    Against: {proposal.votesAgainst.toLocaleString()}
                    <ArrowDown className="h-4 w-4" />
                  </span>
                </div>
                <div className="h-3 bg-destructive/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>

              {/* Vote Buttons */}
              {proposal.status === "active" && (
                <div className="flex gap-2">
                  <Button
                    variant={userVote === "for" ? "default" : "outline"}
                    className={`flex-1 ${userVote === "for" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}`}
                    onClick={() => onVote("for")}
                    disabled={!!userVote}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Vote For
                  </Button>
                  <Button
                    variant={userVote === "against" ? "default" : "outline"}
                    className={`flex-1 ${userVote === "against" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
                    onClick={() => onVote("against")}
                    disabled={!!userVote}
                  >
                    <ArrowDown className="h-4 w-4" />
                    Vote Against
                  </Button>
                </div>
              )}

              {userVote && (
                <p className="text-center text-sm text-muted-foreground">
                  You voted <span className={userVote === "for" ? "text-success" : "text-destructive"}>{userVote}</span>
                </p>
              )}

              {proposal.status !== "active" && (
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">
                    {proposal.status === "passed" && (
                      <span className="flex items-center justify-center gap-1 text-success">
                        <CheckCircle className="h-4 w-4" />
                        Proposal Passed
                      </span>
                    )}
                    {proposal.status === "rejected" && (
                      <span className="flex items-center justify-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" />
                        Proposal Rejected
                      </span>
                    )}
                    {proposal.status === "pending" && (
                      <span className="flex items-center justify-center gap-1 text-warning">
                        <Clock className="h-4 w-4" />
                        Voting Not Started
                      </span>
                    )}
                  </p>
                </div>
              )}

              <Button variant="ghost" size="sm" className="w-full text-primary">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Blockchain
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </StaggerItem>
  );
}
