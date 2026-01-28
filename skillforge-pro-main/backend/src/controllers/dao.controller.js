import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { DAOProposal } from "../models/DAOProposal.js";

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

  return ok(res, { proposal: mapProposal(proposal) }, "Vote recorded");
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
