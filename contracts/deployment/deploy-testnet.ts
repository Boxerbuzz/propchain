import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

interface DeploymentConfig {
  network: string;
  timestamp: string;
  deployer: string;
  contracts: {
    [key: string]: {
      address: string;
      deployedAt: string;
      deploymentTx: string;
      version: string;
    };
  };
}

async function main() {
  console.log("🚀 Starting deployment to Hedera Testnet...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deployer address: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} HBAR\n`);

  if (balance < ethers.parseEther("10")) {
    console.warn("⚠️  Warning: Balance is low. You may need more HBAR for deployment.\n");
  }

  const config: DeploymentConfig = {
    network: "hedera_testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {}
  };

  // Deploy GovernanceExecutor
  console.log("📝 Deploying GovernanceExecutor...");
  const GovernanceExecutor = await ethers.getContractFactory("GovernanceExecutor");
  const governanceExecutor = await GovernanceExecutor.deploy();
  await governanceExecutor.waitForDeployment();
  const govAddress = await governanceExecutor.getAddress();
  
  console.log(`   ✅ GovernanceExecutor deployed at: ${govAddress}`);
  config.contracts.governanceExecutor = {
    address: govAddress,
    deployedAt: new Date().toISOString(),
    deploymentTx: governanceExecutor.deploymentTransaction()?.hash || "",
    version: "1.0.0"
  };
  console.log("");

  // Deploy DividendDistributor
  console.log("📝 Deploying DividendDistributor...");
  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy();
  await dividendDistributor.waitForDeployment();
  const divAddress = await dividendDistributor.getAddress();
  
  console.log(`   ✅ DividendDistributor deployed at: ${divAddress}`);
  config.contracts.dividendDistributor = {
    address: divAddress,
    deployedAt: new Date().toISOString(),
    deploymentTx: dividendDistributor.deploymentTransaction()?.hash || "",
    version: "1.0.0"
  };
  console.log("");

  // Deploy MultiSigTreasury
  console.log("📝 Deploying MultiSigTreasury...");
  const initialSigners = [deployer.address]; // Add more signers as needed
  const requiredApprovals = 1; // Adjust based on requirements
  const propertyOwner = deployer.address; // Platform as initial property owner
  
  const MultiSigTreasury = await ethers.getContractFactory("MultiSigTreasury");
  const multiSigTreasury = await MultiSigTreasury.deploy(initialSigners, requiredApprovals, propertyOwner);
  await multiSigTreasury.waitForDeployment();
  const treasuryAddress = await multiSigTreasury.getAddress();
  
  console.log(`   ✅ MultiSigTreasury deployed at: ${treasuryAddress}`);
  console.log(`   Initial signers: ${initialSigners.length}`);
  console.log(`   Required approvals: ${requiredApprovals}`);
  config.contracts.multiSigTreasury = {
    address: treasuryAddress,
    deployedAt: new Date().toISOString(),
    deploymentTx: multiSigTreasury.deploymentTransaction()?.hash || "",
    version: "1.0.0"
  };
  console.log("");

  // Deploy PlatformEscrowManager
  console.log("📝 Deploying PlatformEscrowManager...");
  const PlatformEscrowManager = await ethers.getContractFactory("PlatformEscrowManager");
  const platformEscrowManager = await PlatformEscrowManager.deploy();
  await platformEscrowManager.waitForDeployment();
  const escrowAddress = await platformEscrowManager.getAddress();
  
  console.log(`   ✅ PlatformEscrowManager deployed at: ${escrowAddress}`);
  config.contracts.platformEscrowManager = {
    address: escrowAddress,
    deployedAt: new Date().toISOString(),
    deploymentTx: platformEscrowManager.deploymentTransaction()?.hash || "",
    version: "1.0.0"
  };
  console.log("");

  // Save deployment config
  const configPath = join(__dirname, "../testnet-deployment.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`💾 Deployment config saved to: testnet-deployment.json\n`);

  console.log("✅ All contracts deployed successfully!\n");
  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`GovernanceExecutor:      ${govAddress}`);
  console.log(`DividendDistributor:     ${divAddress}`);
  console.log(`MultiSigTreasury:        ${treasuryAddress}`);
  console.log(`PlatformEscrowManager:   ${escrowAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📋 Next steps:");
  console.log("1. Verify contracts on HashScan (https://hashscan.io/testnet)");
  console.log("2. Update Supabase with contract addresses");
  console.log("3. Run integration tests");
  console.log("4. Update frontend configuration\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
