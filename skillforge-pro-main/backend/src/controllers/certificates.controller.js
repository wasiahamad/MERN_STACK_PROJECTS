import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { sha256Hex } from "../utils/crypto.js";
import { issueCertificateOnChain, verifyCertificateOnChain } from "../services/blockchain.service.js";
import path from "path";

function safeDownloadName(name, fallbackExt = "") {
  const base = String(name || "").trim() || `file${fallbackExt}`;
  const cleaned = base
    .replace(/[\\/]/g, "-")
    .replace(/[\r\n\t]/g, " ")
    .replace(/[\"\u0000]/g, "")
    .slice(0, 160)
    .trim();
  if (!fallbackExt) return cleaned || "file";
  return cleaned.toLowerCase().endsWith(fallbackExt.toLowerCase()) ? cleaned : `${cleaned}${fallbackExt}`;
}

function filePathFromUploadsUrl(url) {
  const u = String(url || "");
  if (!u.startsWith("/uploads/")) return "";
  const rel = u.slice("/uploads/".length).replace(/^[/\\]+/, "");
  if (!rel || rel.includes("..")) return "";
  return path.resolve("uploads", rel);
}

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
    fileName: c.fileName || undefined,
    fileMime: c.fileMime || undefined,
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

  const image = req.file ? `/uploads/certificates/${req.file.filename}` : "";
  const fileName = req.file?.originalname ? String(req.file.originalname) : "";
  const fileMime = req.file?.mimetype ? String(req.file.mimetype) : "";

  req.user.certificates.push({
    name: String(name),
    issuer: String(issuer),
    date: String(date),
    nftMinted: false,
    tokenId: credentialId ? String(credentialId) : undefined,
    image,
    fileName,
    fileMime,
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

export const downloadMyCertificateFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const cert = req.user?.certificates?.id(id);
  if (!cert) throw new ApiError(404, "CERT_NOT_FOUND", "Certificate not found");
  if (!cert.image) throw new ApiError(404, "FILE_NOT_FOUND", "No uploaded file for this certificate");

  const absPath = filePathFromUploadsUrl(cert.image);
  if (!absPath) throw new ApiError(400, "INVALID_FILE_URL", "Invalid certificate file URL");

  const ext = String(path.extname(absPath) || "").toLowerCase();
  const inferredPdf =
    ext === ".pdf" ||
    String(cert.fileName || "").toLowerCase().endsWith(".pdf") ||
    String(cert.image || "").toLowerCase().endsWith(".pdf");

  const mime = (() => {
    const m = String(cert.fileMime || "").trim();
    if (m) return m;
    if (inferredPdf) return "application/pdf";
    return "application/octet-stream";
  })();

  const fallbackExt = mime === "application/pdf" ? ".pdf" : ext || "";
  const downloadName = safeDownloadName(cert.fileName || cert.name || "certificate", fallbackExt);

  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);

  return res.sendFile(absPath, (err) => {
    if (err) return next(new ApiError(404, "FILE_NOT_FOUND", "File not found on server"));
  });
});
