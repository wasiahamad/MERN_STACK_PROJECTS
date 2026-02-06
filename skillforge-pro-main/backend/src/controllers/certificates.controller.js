import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { sha256Hex } from "../utils/crypto.js";
import { issueCertificateOnChain, verifyCertificateOnChain } from "../services/blockchain.service.js";

function explorerTxUrl(txHash) {
  const base = String(env.BLOCKCHAIN_EXPLORER_BASE_URL || "").trim();
  if (!base || !txHash) return "";
  return `${base.replace(/\/$/, "")}/tx/${txHash}`;
}

function mapCertificate(c) {
  return {
    id: String(c._id),
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    nftMinted: !!c.nftMinted,
    tokenId: c.tokenId || undefined,
    image: c.image,
    verified: !!c.verified,

    // Optional chain fields (UI can ignore)
    chainHash: c.chainHash || undefined,
    chainTxHash: c.chainTxHash || undefined,
    chainContractAddress: c.chainContractAddress || undefined,
    chainNetwork: c.chainNetwork || undefined,
  };
}

export const listMyCertificates = asyncHandler(async (req, res) => {
  const items = (req.user.certificates || []).map(mapCertificate);
  return ok(res, { items }, "Certificates");
});

export const createCertificate = asyncHandler(async (req, res) => {
  const { name, issuer, date, credentialId } = req.body || {};
  if (!name || !issuer || !date) {
    throw new ApiError(400, "VALIDATION", "name, issuer, date are required");
  }

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  req.user.certificates.push({
    name: String(name),
    issuer: String(issuer),
    date: String(date),
    nftMinted: false,
    tokenId: credentialId ? String(credentialId) : undefined,
    image,
    verified: false,
  });

  await req.user.save();

  const createdCert = req.user.certificates[req.user.certificates.length - 1];
  return created(res, { certificate: mapCertificate(createdCert) }, "Certificate uploaded");
});

export const mintCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cert = req.user.certificates.id(id);
  if (!cert) throw new ApiError(404, "CERT_NOT_FOUND", "Certificate not found");

  // Deterministic, PII-free input: certificate subdoc id
  const hashHex = sha256Hex(`CERT:${String(cert._id)}`);

  // If already minted/issued, return stored values
  if (cert.nftMinted && cert.chainTxHash) {
    return ok(
      res,
      {
        tokenId: cert.tokenId,
        txHash: cert.chainTxHash,
        explorerUrl: explorerTxUrl(cert.chainTxHash),
      },
      "Minted"
    );
  }

  // Feature-flagged blockchain integration
  if (env.BLOCKCHAIN_ENABLED) {
    const onChain = await issueCertificateOnChain(hashHex);

    cert.nftMinted = true;
    cert.chainHash = hashHex;
    cert.chainTxHash = onChain.txHash;
    cert.chainContractAddress = onChain.contractAddress;
    cert.chainNetwork = onChain.network;
    cert.chainIssuedAt = new Date();
    // On-chain issuance is the verification source of truth
    cert.verified = true;
    await req.user.save();

    return ok(
      res,
      {
        tokenId: cert.tokenId,
        txHash: onChain.txHash,
        explorerUrl: onChain.explorerUrl,
      },
      "Minted"
    );
  }

  // Backward-compatible fallback when chain is disabled
  if (!cert.nftMinted) {
    cert.nftMinted = true;
    cert.tokenId = cert.tokenId || `token_${Date.now()}`;
    cert.chainHash = hashHex;
    await req.user.save();
  }

  return ok(res, { tokenId: cert.tokenId, txHash: "", explorerUrl: "" }, "Minted");
});

export const verifyMyCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cert = req.user.certificates.id(id);
  if (!cert) throw new ApiError(404, "CERT_NOT_FOUND", "Certificate not found");

  if (!env.BLOCKCHAIN_ENABLED) {
    throw new ApiError(503, "BLOCKCHAIN_DISABLED", "Blockchain verification is disabled");
  }

  const hashHex = cert.chainHash || sha256Hex(`CERT:${String(cert._id)}`);
  const out = await verifyCertificateOnChain(hashHex);

  if (out.verified) {
    cert.verified = true;
    cert.chainHash = hashHex;
    cert.chainContractAddress = out.contractAddress;
    cert.chainNetwork = out.network;
    await req.user.save();
  }

  return ok(
    res,
    {
      verified: out.verified,
      txHash: cert.chainTxHash || "",
      explorerUrl: explorerTxUrl(cert.chainTxHash || ""),
      network: out.network,
      contractAddress: out.contractAddress,
    },
    "Verified"
  );
});

export const verifyCertificatePublic = asyncHandler(async (req, res) => {
  const { certificateId, hash } = req.body || {};

  const hashHex = hash
    ? String(hash).replace(/^0x/i, "")
    : sha256Hex(`CERT:${String(certificateId || "")}`);

  if (!hashHex || hashHex.length !== 64) {
    throw new ApiError(400, "VALIDATION", "Provide certificateId or 32-byte hash (hex)");
  }

  if (!env.BLOCKCHAIN_ENABLED) {
    throw new ApiError(503, "BLOCKCHAIN_DISABLED", "Blockchain verification is disabled");
  }

  const out = await verifyCertificateOnChain(hashHex);
  return ok(res, { verified: out.verified, network: out.network, contractAddress: out.contractAddress }, "Verified");
});
