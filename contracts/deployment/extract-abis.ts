import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Extract ABIs from Hardhat artifacts and save them for frontend/backend use
 */

const contracts = [
  "GovernanceExecutor",
  "DividendDistributor",
  "MultiSigTreasury",
  "PlatformEscrowManager"
];

const abis: { [key: string]: any } = {};

console.log("📦 Extracting ABIs from compiled artifacts...\n");

contracts.forEach((contractName) => {
  const artifactPath = join(
    __dirname,
    `../artifacts/solidity/${contractName}.sol/${contractName}.json`
  );
  
  try {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
    abis[contractName] = artifact.abi;
    console.log(`✅ ${contractName}: ${artifact.abi.length} functions/events`);
  } catch (error) {
    console.error(`❌ Failed to extract ABI for ${contractName}:`, error);
  }
});

// Save combined ABIs
const outputPath = join(__dirname, "../contract-abis.json");
writeFileSync(outputPath, JSON.stringify(abis, null, 2));

console.log(`\n💾 All ABIs saved to: contract-abis.json`);
console.log("\n📋 You can now:");
console.log("1. Import ABIs in your frontend code");
console.log("2. Use ABIs for Supabase insertion");
console.log("3. Share ABIs with backend services\n");

