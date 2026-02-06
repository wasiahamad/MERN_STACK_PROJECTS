const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAOGovernance", function () {
  it("creates proposals and records votes with one-wallet-one-vote", async function () {
    const [owner, user1] = await ethers.getSigners();

    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAOGovernance.deploy();
    await dao.waitForDeployment();

    const proposalHash = ethers.keccak256(ethers.toUtf8Bytes("proposal-1"));

    await expect(dao.createProposal(proposalHash))
      .to.emit(dao, "ProposalCreated")
      .withArgs(proposalHash);

    await expect(dao.recordVote(proposalHash, user1.address, true))
      .to.emit(dao, "VoteRecorded")
      .withArgs(proposalHash, user1.address, true);

    await expect(dao.recordVote(proposalHash, user1.address, false)).to.be.revertedWith(
      "ALREADY_VOTED"
    );

    const counts = await dao.getCounts(proposalHash);
    expect(counts[0]).to.equal(1);
    expect(counts[1]).to.equal(0);
  });
});
