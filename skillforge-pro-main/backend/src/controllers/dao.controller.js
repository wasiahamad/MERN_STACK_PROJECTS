import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { DAOProposal } from "../models/DAOProposal.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { sha256Hex } from "../utils/crypto.js";
import {
  createDaoProposalOnChain,
  getDaoCountsOnChain,
  recordDaoVoteOnChain,
} from "../services/blockchain.service.js";

function isOwner(user, p) {
  if (!user) return false;
  if (p.proposerUserId && String(p.proposerUserId) === String(user._id)) return true;
  const label = p.proposer || "";
  return label && (label === user.name || label === user.email);
}

function mapProposal(p, user) {
  return {
    id: String(p._id),
    title: p.title,
    description: p.description,
    proposer: p.proposer,
    proposerUserId: p.proposerUserId ? String(p.proposerUserId) : undefined,
    status: p.status,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    endDate: p.endDate,
    category: p.category,

    canManage: user ? isOwner(user, p) : undefined,

    chainHash: p.chainHash || undefined,
    chainTxHash: p.chainTxHash || undefined,
    chainContractAddress: p.chainContractAddress || undefined,
    chainNetwork: p.chainNetwork || undefined,
  };
}

export const listProposals = asyncHandler(async (req, res) => {
  const { status } = req.query || {};
  const q = { deletedAt: null };
  if (status) q.status = String(status);

  const items = await DAOProposal.find(q).sort({ createdAt: -1 });
  return ok(res, { items: items.map((p) => mapProposal(p, req.user)) }, "Proposals");
});

export const createProposal = asyncHandler(async (req, res) => {
  const { title, description, category, endDate } = req.body || {};
  if (!title || !description || !endDate) {
    throw new ApiError(400, "VALIDATION", "title, description, endDate are required");
  }

  const proposerLabel = req.user.walletAddress || req.user.name || req.user.email;

  const p = await DAOProposal.create({
    title: String(title),
    description: String(description),
    category: category ? String(category) : "general",
    endDate: String(endDate),
    proposer: proposerLabel,
    proposerUserId: req.user._id,
    status: "active",
  });

  // Deterministic, PII-free hash input: proposal mongo id
  const proposalHashHex = sha256Hex(`DAO:${String(p._id)}`);

  // Optionally push proposal hash on-chain
  if (env.BLOCKCHAIN_ENABLED) {
    const onChain = await createDaoProposalOnChain(proposalHashHex);
    p.chainHash = proposalHashHex;
    p.chainTxHash = onChain.txHash;
    p.chainContractAddress = onChain.contractAddress;
    p.chainNetwork = onChain.network;
    await p.save();
  } else {
    // Store hash for later use even if chain disabled
    p.chainHash = proposalHashHex;
    await p.save();
  }

  return created(res, { proposal: mapProposal(p, req.user) }, "Proposal created");
});

export const voteOnProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body || {};
  if (!vote || !["for", "against"].includes(String(vote))) {
    throw new ApiError(400, "VALIDATION", "vote must be 'for' or 'against'");
  }

  const proposal = await DAOProposal.findById(id).select("+voters");
  if (!proposal) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (proposal.deletedAt) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (proposal.status !== "active") throw new ApiError(400, "VOTING_CLOSED", "Voting is closed");

  const already = proposal.voters.some((v) => String(v.userId) === String(req.user._id));
  if (already) throw new ApiError(409, "ALREADY_VOTED", "You already voted");

  // Record vote on-chain first (when enabled), so we don't persist a DB vote that can't be recorded on-chain.
  if (env.BLOCKCHAIN_ENABLED) {
    if (!req.user.walletAddress) throw new ApiError(400, "WALLET_NOT_LINKED", "Link a wallet before voting");
    if (!req.user.walletVerifiedAt) throw new ApiError(400, "WALLET_NOT_VERIFIED", "Verify wallet ownership before voting");
    if (!proposal.chainHash) throw new ApiError(500, "PROPOSAL_HASH_MISSING", "Proposal chain hash missing");

    await recordDaoVoteOnChain({
      proposalHashHex: proposal.chainHash,
      voterAddress: req.user.walletAddress,
      support: vote === "for",
    });
  }

  proposal.voters.push({ userId: req.user._id, vote: String(vote) });
  if (vote === "for") proposal.votesFor += 1;
  else proposal.votesAgainst += 1;

  await proposal.save();

  return ok(res, { proposal: mapProposal(proposal, req.user) }, "Vote recorded");
});

export const syncProposalOnChain = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await DAOProposal.findById(id);
  if (!proposal) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (proposal.deletedAt) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (!env.BLOCKCHAIN_ENABLED) {
    throw new ApiError(503, "BLOCKCHAIN_DISABLED", "Blockchain sync is disabled");
  }
  if (!proposal.chainHash) {
    throw new ApiError(400, "PROPOSAL_HASH_MISSING", "Proposal does not have an on-chain hash");
  }

  const counts = await getDaoCountsOnChain(proposal.chainHash);
  proposal.votesFor = counts.votesFor;
  proposal.votesAgainst = counts.votesAgainst;
  proposal.chainContractAddress = counts.contractAddress;
  proposal.chainNetwork = counts.network;
  proposal.chainSyncedAt = new Date();

  // Best-effort status update once endDate is passed
  const end = new Date(String(proposal.endDate));
  if (!Number.isNaN(end.getTime()) && end.getTime() <= Date.now()) {
    proposal.status = proposal.votesFor >= proposal.votesAgainst ? "passed" : "rejected";
  }

  await proposal.save();
  return ok(res, { proposal: mapProposal(proposal, req.user) }, "Synced");
});

export const updateProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, endDate } = req.body || {};

  const proposal = await DAOProposal.findById(id);
  if (!proposal || proposal.deletedAt) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (proposal.status !== "active") throw new ApiError(400, "NOT_EDITABLE", "Only active proposals can be edited");
  if (!isOwner(req.user, proposal)) throw new ApiError(403, "FORBIDDEN", "You can't edit this proposal");

  if (title !== undefined) {
    const next = String(title).trim();
    if (next.length < 3) throw new ApiError(400, "VALIDATION", "title must be at least 3 characters");
    proposal.title = next;
  }
  if (description !== undefined) {
    const next = String(description).trim();
    if (next.length < 10) throw new ApiError(400, "VALIDATION", "description must be at least 10 characters");
    proposal.description = next;
  }
  if (category !== undefined) {
    proposal.category = String(category).trim() || "general";
  }
  if (endDate !== undefined) {
    const next = String(endDate).trim();
    if (!next) throw new ApiError(400, "VALIDATION", "endDate is required");
    proposal.endDate = next;
  }

  await proposal.save();
  return ok(res, { proposal: mapProposal(proposal, req.user) }, "Proposal updated");
});

export const deleteProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await DAOProposal.findById(id);
  if (!proposal || proposal.deletedAt) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (!isOwner(req.user, proposal)) throw new ApiError(403, "FORBIDDEN", "You can't delete this proposal");

  proposal.deletedAt = new Date();
  await proposal.save();
  return ok(res, { ok: true }, "Proposal deleted");
});

export const setProposalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const next = String(status || "").trim();
  if (!next || !["active", "passed", "rejected"].includes(next)) {
    throw new ApiError(400, "VALIDATION", "status must be 'active', 'passed', or 'rejected'");
  }

  const proposal = await DAOProposal.findById(id);
  if (!proposal || proposal.deletedAt) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (!isOwner(req.user, proposal)) throw new ApiError(403, "FORBIDDEN", "You can't change this proposal status");

  proposal.status = next;
  await proposal.save();
  return ok(res, { proposal: mapProposal(proposal, req.user) }, "Status updated");
});

export const daoMe = asyncHandler(async (req, res) => {
  return ok(
    res,
    {
      votingPower: req.user.reputation ?? 0,
      reputation: req.user.reputation ?? 0,
    },
    "DAO me"
  );
});

export const daoStats = asyncHandler(async (req, res) => {
  // Keep it simple: treat verified candidates as DAO members.
  const members = await User.countDocuments({
    role: "candidate",
    emailVerified: true,
  });
  return ok(res, { members }, "DAO stats");
});
