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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { DAOProposal } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import {
  useCreateDaoProposal,
  useDaoMe,
  useDaoProposals,
  useDaoStats,
  useDeleteDaoProposal,
  useSetDaoProposalStatus,
  useUpdateDaoProposal,
  useVoteOnProposal,
} from "@/lib/apiHooks";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";

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
  general: { color: "bg-primary/10 text-primary", icon: Vote },
};

export default function DAO() {
  const { user, refreshMe } = useAuth();
  const [filter, setFilter] = useState<"all" | "active" | "passed" | "rejected" | "pending">("all");
  const [votedProposals, setVotedProposals] = useState<Record<string, "for" | "against">>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "general",
    endDate: "",
  });

  const proposalsQuery = useDaoProposals(filter === "all" ? undefined : filter);
  const daoMeQuery = useDaoMe(!!user);
  const daoStatsQuery = useDaoStats(!!user);
  const voteMutation = useVoteOnProposal();
  const createMutation = useCreateDaoProposal();
  const linkWalletWithSignature = async () => {
    try {
      setWalletBusy(true);
      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        toast({
          title: "MetaMask not found",
          description: "Install MetaMask (or a compatible wallet) to link your wallet.",
          variant: "destructive",
        });
        return;
      }

      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const address = accounts?.[0];
      if (!address) {
        toast({ title: "No wallet selected", description: "Please select an account in your wallet.", variant: "destructive" });
        return;
      }

      const nonceOut = await apiFetch<{ address: string; nonce: string; message: string }>(
        `/api/me/wallet/nonce?address=${encodeURIComponent(address)}`
      );

      const signature = (await eth.request({
        method: "personal_sign",
        params: [nonceOut.message, address],
      })) as string;

      await apiFetch<{ walletAddress: string; walletVerified: boolean }>("/api/me/wallet/link", {
        method: "POST",
        body: { address, signature },
      });

      await refreshMe();
      toast({ title: "Wallet linked", description: "Wallet ownership verified successfully." });
    } catch (e: any) {
      toast({ title: "Unable to link wallet", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setWalletBusy(false);
    }
  };


  const items = proposalsQuery.data?.items ?? [];

  const handleVote = async (proposalId: string, vote: "for" | "against") => {
    const prevVote = votedProposals[proposalId];
    setVotedProposals((p) => ({ ...p, [proposalId]: vote }));
    try {
      await voteMutation.mutateAsync({ id: proposalId, vote });
      toast({
        title: "Vote Submitted!",
        description: "Your vote has been recorded.",
      });
    } catch (e: any) {
      setVotedProposals((p) => {
        const next = { ...p };
        if (prevVote) next[proposalId] = prevVote;
        else delete next[proposalId];
        return next;
      });
      toast({
        title: "Unable to vote",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const totalVotingPower = daoMeQuery.data?.votingPower ?? user?.reputation ?? 0;
  const activeProposals = items.filter((p) => p.status === "active").length;

  const submitCreateProposal = async () => {
    const title = draft.title.trim();
    const description = draft.description.trim();
    const category = draft.category.trim() || "general";
    const endDate = draft.endDate.trim();

    if (title.length < 3) {
      toast({ variant: "destructive", title: "Validation", description: "Title must be at least 3 characters." });
      return;
    }
    if (description.length < 10) {
      toast({ variant: "destructive", title: "Validation", description: "Description must be at least 10 characters." });
      return;
    }
    if (!endDate) {
      toast({ variant: "destructive", title: "Validation", description: "End date is required." });
      return;
    }

    setCreateBusy(true);
    try {
      await createMutation.mutateAsync({ title, description, category, endDate });
      toast({ title: "Proposal created", description: "Your proposal is now live for voting." });
      setDraft({ title: "", description: "", category: "general", endDate: "" });
      setCreateOpen(false);
      setFilter("active");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Create failed", description: e?.message || "Please try again" });
    } finally {
      setCreateBusy(false);
    }
  };

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
          <div className="flex items-center gap-2">
            {user && (!user.walletAddress || !user.walletVerified) && (
              <Button variant="outline" onClick={linkWalletWithSignature} disabled={walletBusy}>
                {walletBusy ? "Linking..." : "Link Wallet"}
              </Button>
            )}
            <GradientButton onClick={() => setCreateOpen((v) => !v)}>
              <Plus className="h-4 w-4" />
              Create Proposal
            </GradientButton>
          </div>
        </motion.div>

        {createOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard hover={false} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Proposal title"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={draft.category}
                    onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="general">general</option>
                    <option value="governance">governance</option>
                    <option value="feature">feature</option>
                    <option value="moderation">moderation</option>
                    <option value="treasury">treasury</option>
                  </select>
                </div>
                <div>
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={draft.endDate}
                    onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={draft.description}
                    onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Explain the proposal clearly"
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateOpen(false);
                    }}
                    disabled={createBusy}
                  >
                    Cancel
                  </Button>
                  <GradientButton onClick={submitCreateProposal} disabled={createBusy}>
                    {createBusy ? "Creating..." : "Create"}
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

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
            <p className="text-2xl font-bold">{items.length}</p>
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
            <p className="text-2xl font-bold">{daoStatsQuery.data?.members ?? "--"}</p>
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
          {proposalsQuery.isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-muted-foreground">Loading proposals...</p>
            </motion.div>
          )}

          {!proposalsQuery.isLoading && items.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              userVote={votedProposals[proposal.id]}
              onVote={(vote) => handleVote(proposal.id, vote)}
            />
          ))}
          {!proposalsQuery.isLoading && items.length === 0 && (
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
  const updateMutation = useUpdateDaoProposal();
  const deleteMutation = useDeleteDaoProposal();
  const statusMutation = useSetDaoProposalStatus();
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editDraft, setEditDraft] = useState({
    title: proposal.title,
    description: proposal.description,
    category: proposal.category,
    endDate: proposal.endDate,
  });

  const status = statusConfig[proposal.status];
  const category = (categoryConfig as any)[proposal.category] || categoryConfig.governance;
  const CategoryIcon = category.icon;
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;

  const canManage = !!proposal.canManage;

  const saveEdits = async () => {
    const title = editDraft.title.trim();
    const description = editDraft.description.trim();
    const category = String(editDraft.category || "general").trim() || "general";
    const endDate = String(editDraft.endDate || "").trim();

    if (title.length < 3) {
      toast({ variant: "destructive", title: "Validation", description: "Title must be at least 3 characters." });
      return;
    }
    if (description.length < 10) {
      toast({ variant: "destructive", title: "Validation", description: "Description must be at least 10 characters." });
      return;
    }
    if (!endDate) {
      toast({ variant: "destructive", title: "Validation", description: "End date is required." });
      return;
    }

    setEditBusy(true);
    try {
      await updateMutation.mutateAsync({ id: proposal.id, body: { title, description, category, endDate } });
      toast({ title: "Updated", description: "Proposal updated successfully." });
      setEditOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update failed", description: e?.message || "Please try again" });
    } finally {
      setEditBusy(false);
    }
  };

  const deleteProposal = async () => {
    try {
      await deleteMutation.mutateAsync({ id: proposal.id });
      toast({ title: "Deleted", description: "Proposal deleted." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e?.message || "Please try again" });
    }
  };

  const setStatus = async (next: "active" | "passed" | "rejected") => {
    try {
      await statusMutation.mutateAsync({ id: proposal.id, status: next });
      toast({ title: "Status updated", description: `Proposal marked as ${next}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Status update failed", description: e?.message || "Please try again" });
    }
  };

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
              {canManage && (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                  Manage
                </Badge>
              )}
            </div>

            {!editOpen ? (
              <>
                <h3 className="font-display text-lg font-semibold mb-2">{proposal.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{proposal.description}</p>
              </>
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editDraft.title} onChange={(e) => setEditDraft((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={editDraft.endDate}
                    onChange={(e) => setEditDraft((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editDraft.description}
                    onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditDraft({
                        title: proposal.title,
                        description: proposal.description,
                        category: proposal.category,
                        endDate: proposal.endDate,
                      });
                      setEditOpen(false);
                    }}
                    disabled={editBusy}
                  >
                    Cancel
                  </Button>
                  <GradientButton onClick={saveEdits} disabled={editBusy}>
                    {editBusy ? "Saving..." : "Save"}
                  </GradientButton>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Proposed by: {proposal.proposer}</span>
              <span>Ends: {proposal.endDate}</span>
            </div>

            {canManage && !editOpen && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={proposal.status !== "active"}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={deleteProposal}>
                  Delete
                </Button>
                {proposal.status === "active" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setStatus("passed")}>Mark Passed</Button>
                    <Button variant="outline" size="sm" onClick={() => setStatus("rejected")}>Mark Rejected</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setStatus("active")}>Reopen</Button>
                )}
              </div>
            )}
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
