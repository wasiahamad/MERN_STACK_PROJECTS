import { ethers } from "ethers";

import { env } from "../config/env.js";

function requireEnabled() {
  if (!env.BLOCKCHAIN_ENABLED) {
    const err = new Error("Blockchain is disabled");
    err.code = "BLOCKCHAIN_DISABLED";
    throw err;
  }
}

function requireConfig(value, name) {
  if (!value) {
    const err = new Error(`Missing blockchain env var: ${name}`);
    err.code = "BLOCKCHAIN_MISCONFIG";
    throw err;
  }
  return value;
}

let cached = null;

function getClients() {
  if (cached) return cached;

  requireEnabled();

  const rpcUrl = requireConfig(env.BLOCKCHAIN_RPC_URL, "BLOCKCHAIN_RPC_URL");
  const pk = requireConfig(env.BLOCKCHAIN_PRIVATE_KEY, "BLOCKCHAIN_PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const certificateRegistryAddress = ethers.getAddress(
    requireConfig(env.CERTIFICATE_REGISTRY_ADDRESS, "CERTIFICATE_REGISTRY_ADDRESS")
  );
  const daoGovernanceAddress = ethers.getAddress(
    requireConfig(env.DAO_GOVERNANCE_ADDRESS, "DAO_GOVERNANCE_ADDRESS")
  );

  const certificateRegistryAbi = [
    "event CertificateIssued(bytes32 indexed certHash, address indexed issuer)",
    "function issueCertificate(bytes32 certHash) external",
    "function verifyCertificate(bytes32 certHash) external view returns (bool)",
    "function issued(bytes32 certHash) external view returns (bool)",
  ];

  const daoGovernanceAbi = [
    "event ProposalCreated(bytes32 indexed proposalHash)",
    "event VoteRecorded(bytes32 indexed proposalHash, address indexed voter, bool support)",
    "function createProposal(bytes32 proposalHash) external",
    "function recordVote(bytes32 proposalHash, address voter, bool support) external",
    "function getCounts(bytes32 proposalHash) external view returns (uint256 forVotes, uint256 againstVotes)",
    "function hasVoted(bytes32 proposalHash, address voter) external view returns (bool)",
  ];

  const certificateRegistry = new ethers.Contract(
    certificateRegistryAddress,
    certificateRegistryAbi,
    wallet
  );
  const daoGovernance = new ethers.Contract(daoGovernanceAddress, daoGovernanceAbi, wallet);

  cached = { provider, wallet, certificateRegistry, daoGovernance };
  return cached;
}

async function assertContractDeployed(provider, address, label) {
  const code = await provider.getCode(address);
  if (!code || code === "0x") {
    const network = await provider.getNetwork().catch(() => null);
    const chainId = network?.chainId != null ? String(network.chainId) : "unknown";
    const err = new Error(
      `${label} has no bytecode at ${address} on chainId=${chainId}. ` +
        `Check BLOCKCHAIN_RPC_URL and ${label.toUpperCase().replace(/\s+/g, "_")}_ADDRESS (or redeploy the contracts to this network).`
    );
    err.status = 503;
    err.code = "BLOCKCHAIN_CONTRACT_NOT_DEPLOYED";
    throw err;
  }
}

function asBytes32(hex) {
  const h = String(hex || "").toLowerCase();
  if (!/^([0-9a-f]{64})$/.test(h)) {
    const err = new Error("Expected 32-byte hex (64 chars) without 0x prefix");
    err.code = "INVALID_HASH";
    throw err;
  }
  return `0x${h}`;
}

function explorerTxUrl(txHash) {
  const base = String(env.BLOCKCHAIN_EXPLORER_BASE_URL || "").trim();
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/tx/${txHash}`;
}

export async function issueCertificateOnChain(certHashHex) {
  const { provider, certificateRegistry } = getClients();
  await assertContractDeployed(provider, certificateRegistry.target, "CertificateRegistry");

  const bytes32 = asBytes32(certHashHex);
  const already = await certificateRegistry.issued(bytes32);
  if (already) {
    const err = new Error("Certificate already issued on-chain");
    err.code = "CERT_ALREADY_ISSUED";
    throw err;
  }

  const tx = await certificateRegistry.issueCertificate(bytes32);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || tx.hash,
    contractAddress: certificateRegistry.target,
    network: env.BLOCKCHAIN_NETWORK,
    explorerUrl: explorerTxUrl(receipt?.hash || tx.hash),
  };
}

export async function verifyCertificateOnChain(certHashHex) {
  const { provider, certificateRegistry } = getClients();
  await assertContractDeployed(provider, certificateRegistry.target, "CertificateRegistry");
  const bytes32 = asBytes32(certHashHex);
  const ok = await certificateRegistry.verifyCertificate(bytes32);
  return { verified: !!ok, contractAddress: certificateRegistry.target, network: env.BLOCKCHAIN_NETWORK };
}

export async function createDaoProposalOnChain(proposalHashHex) {
  const { provider, daoGovernance } = getClients();
  await assertContractDeployed(provider, daoGovernance.target, "DAOGovernance");
  const bytes32 = asBytes32(proposalHashHex);

  const tx = await daoGovernance.createProposal(bytes32);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || tx.hash,
    contractAddress: daoGovernance.target,
    network: env.BLOCKCHAIN_NETWORK,
    explorerUrl: explorerTxUrl(receipt?.hash || tx.hash),
  };
}

export async function recordDaoVoteOnChain({ proposalHashHex, voterAddress, support }) {
  const { provider, daoGovernance } = getClients();
  await assertContractDeployed(provider, daoGovernance.target, "DAOGovernance");
  const bytes32 = asBytes32(proposalHashHex);
  const voter = ethers.getAddress(String(voterAddress));

  const already = await daoGovernance.hasVoted(bytes32, voter);
  if (already) {
    const err = new Error("Wallet already voted on-chain");
    err.code = "WALLET_ALREADY_VOTED";
    throw err;
  }

  const tx = await daoGovernance.recordVote(bytes32, voter, !!support);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || tx.hash,
    contractAddress: daoGovernance.target,
    network: env.BLOCKCHAIN_NETWORK,
    explorerUrl: explorerTxUrl(receipt?.hash || tx.hash),
  };
}

export async function getDaoCountsOnChain(proposalHashHex) {
  const { provider, daoGovernance } = getClients();
  await assertContractDeployed(provider, daoGovernance.target, "DAOGovernance");
  const bytes32 = asBytes32(proposalHashHex);
  const [forVotes, againstVotes] = await daoGovernance.getCounts(bytes32);
  return {
    votesFor: Number(forVotes),
    votesAgainst: Number(againstVotes),
    contractAddress: daoGovernance.target,
    network: env.BLOCKCHAIN_NETWORK,
  };
}
