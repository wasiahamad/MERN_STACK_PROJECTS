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

function mapProposal(p) {
  return {
    id: String(p._id),
    title: p.title,
    description: p.description,
    proposer: p.proposer,
    status: p.status,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    endDate: p.endDate,
    category: p.category,

    chainHash: p.chainHash || undefined,
    chainTxHash: p.chainTxHash || undefined,
    chainContractAddress: p.chainContractAddress || undefined,
    chainNetwork: p.chainNetwork || undefined,
  };
}

export const listProposals = asyncHandler(async (req, res) => {
  const { status } = req.query || {};
  const q = {};
  if (status) q.status = String(status);

  const items = await DAOProposal.find(q).sort({ createdAt: -1 });
  return ok(res, { items: items.map(mapProposal) }, "Proposals");
});

export const createProposal = asyncHandler(async (req, res) => {
  const { title, description, category, endDate } = req.body || {};
  if (!title || !description || !endDate) {
    throw new ApiError(400, "VALIDATION", "title, description, endDate are required");
  }

  const p = await DAOProposal.create({
    title: String(title),
    description: String(description),
    category: category ? String(category) : "general",
    endDate: String(endDate),
    proposer: req.user.name || req.user.email,
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

  return created(res, { proposal: mapProposal(p) }, "Proposal created");
});

export const voteOnProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body || {};
  if (!vote || !["for", "against"].includes(String(vote))) {
    throw new ApiError(400, "VALIDATION", "vote must be 'for' or 'against'");
  }

  const proposal = await DAOProposal.findById(id).select("+voters");
  if (!proposal) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
  if (proposal.status !== "active") throw new ApiError(400, "VOTING_CLOSED", "Voting is closed");

  const already = proposal.voters.some((v) => String(v.userId) === String(req.user._id));
  if (already) throw new ApiError(409, "ALREADY_VOTED", "You already voted");

  proposal.voters.push({ userId: req.user._id, vote: String(vote) });
  if (vote === "for") proposal.votesFor += 1;
  else proposal.votesAgainst += 1;

  await proposal.save();

  // Record vote on-chain (backend as relayer/owner), enforcing one wallet = one vote on-chain
  if (env.BLOCKCHAIN_ENABLED) {
    if (!req.user.walletAddress) {
      throw new ApiError(400, "WALLET_NOT_LINKED", "Link a wallet before voting");
    }
    if (!req.user.walletVerifiedAt) {
      throw new ApiError(400, "WALLET_NOT_VERIFIED", "Verify wallet ownership before voting");
    }
    if (!proposal.chainHash) {
      throw new ApiError(500, "PROPOSAL_HASH_MISSING", "Proposal chain hash missing");
    }

    await recordDaoVoteOnChain({
      proposalHashHex: proposal.chainHash,
      voterAddress: req.user.walletAddress,
      support: vote === "for",
    });
  }

  return ok(res, { proposal: mapProposal(proposal) }, "Vote recorded");
});

export const syncProposalOnChain = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await DAOProposal.findById(id);
  if (!proposal) throw new ApiError(404, "PROPOSAL_NOT_FOUND", "Proposal not found");
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
  return ok(res, { proposal: mapProposal(proposal) }, "Synced");
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
