const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  it("issues and verifies a certificate hash", async function () {
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    const registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();

    const hash = ethers.keccak256(ethers.toUtf8Bytes("cert-1"));
    expect(await registry.verifyCertificate(hash)).to.equal(false);

    await expect(registry.issueCertificate(hash))
      .to.emit(registry, "CertificateIssued")
      .withArgs(hash, (await ethers.getSigners())[0].address);

    expect(await registry.verifyCertificate(hash)).to.equal(true);
  });

  it("prevents duplicate issuance", async function () {
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    const registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();

    const hash = ethers.keccak256(ethers.toUtf8Bytes("cert-dup"));
    await registry.issueCertificate(hash);
    await expect(registry.issueCertificate(hash)).to.be.revertedWith("ALREADY_ISSUED");
  });
});
