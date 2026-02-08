import mongoose from "mongoose";

const DAOProposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposer: { type: String, required: true },
    proposerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: ["active", "passed", "rejected"], default: "active", index: true },
    votesFor: { type: Number, default: 0 },
    votesAgainst: { type: Number, default: 0 },
    endDate: { type: String, required: true },
    category: { type: String, default: "general" },

    deletedAt: { type: Date, default: null, index: true },

    voters: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          vote: { type: String, enum: ["for", "against"] },
        },
      ],
      default: [],
      select: false,
    },

    // On-chain metadata (stores only hash + tx; no PII)
    chainHash: { type: String, default: "" },
    chainTxHash: { type: String, default: "" },
    chainContractAddress: { type: String, default: "" },
    chainNetwork: { type: String, default: "" },
    chainSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DAOProposalSchema.index({ status: 1, endDate: 1 });
DAOProposalSchema.index({ deletedAt: 1, status: 1, endDate: 1 });

export const DAOProposal = mongoose.model("DAOProposal", DAOProposalSchema);
