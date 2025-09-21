import { Client, PrivateKey } from "@hashgraph/sdk";

const hederaOperatorId = import.meta.env.VITE_HEDERA_OPERATOR_ID;
const hederaOperatorPrivateKey = import.meta.env
  .VITE_HEDERA_OPERATOR_PRIVATE_KEY;

// Ensure that your environment variables are set
if (!hederaOperatorId || !hederaOperatorPrivateKey) {
  throw new Error(
    "Hedera operator ID and private key must be set in the environment variables."
  );
}

// Create our connection to the Hedera network
// For a mainnet account, please utilize `Client.forMainnet()`
// For a testnet account, please utilize `Client.forTestnet()`
// For a previewnet account, please utilize `Client.forPreviewnet()`
export const hederaClient = Client.forTestnet();
hederaClient.setOperator(
  hederaOperatorId,
  PrivateKey.fromStringECDSA(hederaOperatorPrivateKey)
);
