// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DAOGovernance {
    address public owner;

    struct Counts {
        uint256 forVotes;
        uint256 againstVotes;
        bool exists;
    }

    mapping(bytes32 => Counts) private _counts;
    mapping(bytes32 => mapping(address => bool)) private _voted;

    event ProposalCreated(bytes32 indexed proposalHash);
    event VoteRecorded(bytes32 indexed proposalHash, address indexed voter, bool support);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProposal(bytes32 proposalHash) external onlyOwner {
        require(proposalHash != bytes32(0), "INVALID_HASH");
        require(!_counts[proposalHash].exists, "PROPOSAL_EXISTS");

        _counts[proposalHash] = Counts({forVotes: 0, againstVotes: 0, exists: true});
        emit ProposalCreated(proposalHash);
    }

    function recordVote(bytes32 proposalHash, address voter, bool support) external onlyOwner {
        require(_counts[proposalHash].exists, "PROPOSAL_MISSING");
        require(voter != address(0), "INVALID_VOTER");
        require(!_voted[proposalHash][voter], "ALREADY_VOTED");

        _voted[proposalHash][voter] = true;

        if (support) {
            _counts[proposalHash].forVotes += 1;
        } else {
            _counts[proposalHash].againstVotes += 1;
        }

        emit VoteRecorded(proposalHash, voter, support);
    }

    function hasVoted(bytes32 proposalHash, address voter) external view returns (bool) {
        return _voted[proposalHash][voter];
    }

    function getCounts(bytes32 proposalHash) external view returns (uint256 forVotes, uint256 againstVotes) {
        require(_counts[proposalHash].exists, "PROPOSAL_MISSING");
        Counts memory c = _counts[proposalHash];
        return (c.forVotes, c.againstVotes);
    }
}
