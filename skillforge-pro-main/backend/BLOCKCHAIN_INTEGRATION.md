# Blockchain Integration (Certificates + DAO)

This project is an existing MERN platform. Blockchain features are added **additively** and are guarded behind an env flag so existing flows keep working.

## Features

### 1) Certificate Verification (on-chain hash registry)

- Backend computes a **SHA-256** hash of a deterministic, non-PII identifier:
  - `sha256("CERT:" + certificateSubdocId)`
- Only the `bytes32` hash is stored on-chain.
- Backend stores `chainTxHash`, `chainContractAddress`, and `chainHash` in MongoDB (inside the user’s embedded certificate entry).

Endpoints (existing + extended):
- `POST /api/certificates/me/:id/mint`
  - When `BLOCKCHAIN_ENABLED=true`, calls `issueCertificate(bytes32 hash)`.
- `POST /api/certificates/verify`
  - Body: `{ "certificateId": "<id>" }` or `{ "hash": "<64hex or 0x-prefixed>" }`
  - Calls `verifyCertificate(bytes32 hash)`.

### 2) DAO Governance (proposal hash + vote counts on-chain)

- Backend computes proposal hash:
  - `sha256("DAO:" + proposalId)`
- Proposal is created on-chain by the backend (owner) using:
  - `createProposal(bytes32 proposalHash)`
- Votes are recorded on-chain by the backend (owner) using:
  - `recordVote(bytes32 proposalHash, address voter, bool support)`
- Contract enforces **one wallet = one vote** via `(proposalHash, voter)` mapping.

Endpoints (existing + extended):
- `POST /api/dao/proposals`
  - Creates Mongo proposal, then stores hash on-chain (when enabled).
- `POST /api/dao/proposals/:id/votes`
  - Keeps existing DB vote recording.
  - When enabled, also records on-chain vote for the user’s linked wallet.
- `POST /api/dao/proposals/:id/sync`
  - Reads on-chain counts and updates Mongo `votesFor/votesAgainst` and status (best-effort).

## Wallet Linking (ownership verification)

The user model already had `walletAddress`; this adds **signature-based verification**.

- `GET /api/me/wallet/nonce?address=0x...`
  - Returns a message to sign.
- `POST /api/me/wallet/link`
  - Body: `{ "address": "0x...", "signature": "0x..." }`
  - Verifies signature and sets `walletAddress` + `walletVerifiedAt`.
  - Enforces one wallet globally (no duplicates across users).

## Environment Variables

Backend (runtime):
- `BLOCKCHAIN_ENABLED=true|false`
- `BLOCKCHAIN_NETWORK=polygon-amoy` (any label)
- `BLOCKCHAIN_RPC_URL=<rpc url>`
- `BLOCKCHAIN_PRIVATE_KEY=<relayer/owner private key>`
- `BLOCKCHAIN_EXPLORER_BASE_URL=https://amoy.polygonscan.com` (optional)
- `CERTIFICATE_REGISTRY_ADDRESS=0x...`
- `DAO_GOVERNANCE_ADDRESS=0x...`

## Deployment

### Compile / Test contracts

From `backend/`:
- `npm install`
- `npm run hardhat:compile`
- `npm run hardhat:test`

### Deploy contracts (generic RPC network)

Set env vars, then:
- `npm run hardhat:deploy`

Copy printed addresses into:
- `CERTIFICATE_REGISTRY_ADDRESS`
- `DAO_GOVERNANCE_ADDRESS`

## Data stored on-chain

- Certificates: `bytes32` SHA-256 hash only.
- DAO: `bytes32` proposal hash and vote counts (plus voter-address uniqueness).

No user PII is written on-chain.

## Flow diagram (text)

Certificates:
- User uploads certificate (existing) -> stored in Mongo
- User clicks Mint (existing UI) -> backend
- Backend: sha256(certificateId) -> contract.issueCertificate(hash)
- Backend saves txHash + contractAddress in Mongo

DAO:
- Create proposal -> Mongo create -> sha256(proposalId) -> contract.createProposal(hash)
- Vote -> Mongo vote record -> contract.recordVote(hash, walletAddress, support)
- Optional sync -> backend reads chain counts -> updates Mongo
