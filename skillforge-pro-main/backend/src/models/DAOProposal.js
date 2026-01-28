import mongoose from "mongoose";

const DAOProposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposer: { type: String, required: true },
    status: { type: String, enum: ["active", "passed", "rejected"], default: "active", index: true },
    votesFor: { type: Number, default: 0 },
    votesAgainst: { type: Number, default: 0 },
    endDate: { type: String, required: true },
    category: { type: String, default: "general" },

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
  },
  { timestamps: true }
);

DAOProposalSchema.index({ status: 1, endDate: 1 });

export const DAOProposal = mongoose.model("DAOProposal", DAOProposalSchema);
