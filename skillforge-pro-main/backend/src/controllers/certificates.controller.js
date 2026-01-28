import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";

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

  if (!cert.nftMinted) {
    cert.nftMinted = true;
    cert.tokenId = cert.tokenId || `token_${Date.now()}`;
    await req.user.save();
  }

  return ok(
    res,
    {
      tokenId: cert.tokenId,
      txHash: `0x${Date.now().toString(16)}`,
      explorerUrl: "",
    },
    "Minted"
  );
});
