const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer signer available. Ensure BLOCKCHAIN_PRIVATE_KEY is set and funded for the selected network."
    );
  }

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry", deployer);
  const certificateRegistry = await CertificateRegistry.deploy();
  await certificateRegistry.waitForDeployment();

  const DAOGovernance = await hre.ethers.getContractFactory("DAOGovernance", deployer);
  const daoGovernance = await DAOGovernance.deploy();
  await daoGovernance.waitForDeployment();

  console.log("CertificateRegistry:", await certificateRegistry.getAddress());
  console.log("DAOGovernance:", await daoGovernance.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
