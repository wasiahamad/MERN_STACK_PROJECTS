const hre = require("hardhat");

async function main() {
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy();
  await certificateRegistry.waitForDeployment();

  const DAOGovernance = await hre.ethers.getContractFactory("DAOGovernance");
  const daoGovernance = await DAOGovernance.deploy();
  await daoGovernance.waitForDeployment();

  console.log("CertificateRegistry:", await certificateRegistry.getAddress());
  console.log("DAOGovernance:", await daoGovernance.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
