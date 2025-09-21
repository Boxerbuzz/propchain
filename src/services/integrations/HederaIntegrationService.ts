import {
  Client,
  PrivateKey,
  AccountId,
  Hbar,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TransferTransaction,
  TokenMintTransaction,
  TokenId,
  TokenAssociateTransaction,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import { hederaClient } from "../../lib/hedera";

export class HederaIntegrationService {
  private client: Client;
  private supabaseEdgeFunctionUrl: string;

  constructor() {
    this.client = hederaClient;
    const url = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL;
    if (!url) {
      throw new Error("Supabase Edge Function URL must be set in the environment variables.");
    }
    this.supabaseEdgeFunctionUrl = url;
  }

  /**
   * Creates a new Hedera account by calling a Supabase Edge Function.
   * @returns The new account ID and private key.
   */
  async createAccount(): Promise<{ accountId: string; privateKey: string }> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/create-hedera-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create Hedera account via Edge Function.");
    }
    return result.data;
  }

  /**
   * Mints new tokens on Hedera by calling a Supabase Edge Function.
   * @param tokenId The ID of the token to mint.
   * @param amount The amount of tokens to mint.
   * @param supplyKey The supply key of the token (passed to edge function).
   * @returns The transaction ID.
   */
  async mintTokens(tokenId: string, amount: number, supplyKey: PrivateKey): Promise<string> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/mint-hedera-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId, amount, supplyKey: supplyKey.toString() }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to mint Hedera tokens via Edge Function.");
    }
    return result.data.transactionId;
  }

  /**
   * Transfers tokens from one account to another by calling a Supabase Edge Function.
   * @param senderAccountId The account ID of the sender.
   * @param recipientAccountId The account ID of the recipient.
   * @param tokenId The ID of the token to transfer.
   * @param amount The amount of tokens to transfer.
   * @param senderPrivateKey The private key of the sender (passed to edge function).
   * @returns The transaction ID.
   */
  async transferTokens(
    senderAccountId: string | AccountId,
    recipientAccountId: string | AccountId,
    tokenId: string,
    amount: number,
    senderPrivateKey: PrivateKey
  ): Promise<string> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/transfer-hedera-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderAccountId: senderAccountId.toString(),
        recipientAccountId: recipientAccountId.toString(),
        tokenId,
        amount,
        senderPrivateKey: senderPrivateKey.toString(),
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to transfer Hedera tokens via Edge Function.");
    }
    return result.data.transactionId;
  }

  /**
   * Creates a new Hedera Consensus Service (HCS) topic.
   * Note: This method will still be handled directly by the client as it uses the operator key.
   * If operator key is sensitive, this too should be an edge function.
   * @param topicMemo An optional memo for the topic.
   * @returns The ID of the created topic.
   */
  async createTopic(topicMemo?: string): Promise<string> {
    const transaction = new TopicCreateTransaction().setAdminKey(this.client.operatorPublicKey!); // Assuming operator has admin key
    if (topicMemo) {
      transaction.setTopicMemo(topicMemo);
    }
    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    const topicId = receipt.topicId;
    if (!topicId) throw new Error("Failed to get topic ID");
    return topicId.toString();
  }

  /**
   * Submits a message to a Hedera Consensus Service (HCS) topic.
   * Note: This method will still be handled directly by the client as it uses the operator key.
   * If operator key is sensitive, this too should be an edge function.
   * @param topicId The ID of the topic to submit to.
   * @param message The message to submit.
   * @returns The transaction ID.
   */
  async submitTopicMessage(topicId: string, message: string): Promise<string> {
    const transaction = new TopicMessageSubmitTransaction({
      topicId: AccountId.fromString(topicId),
      message: Buffer.from(message),
    });
    const txResponse = await transaction.execute(this.client);
    return txResponse.transactionId.toString();
  }

  /**
   * Gets messages from a Hedera Consensus Service (HCS) topic by calling a Supabase Edge Function.
   * @param topicId The ID of the topic to query.
   * @returns An array of messages.
   */
  async getTopicMessages(topicId: string): Promise<string[]> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/get-hcs-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to get Hedera topic messages via Edge Function.");
    }
    return result.data.messages;
  }

  /**
   * Gets the HBAR balance of a Hedera account.
   * Note: This method will still be handled directly by the client.
   * @param accountId The ID of the account to query.
   * @returns The balance in Hbar.
   */
  async getAccountBalance(accountId: string | AccountId): Promise<Hbar> {
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId.toString()));
    const accountBalance = await balanceQuery.execute(this.client);
    console.log(`Account ${accountId} HBAR Balance: ${accountBalance.hbars.toString()}`);
    return accountBalance.hbars;
  }

  /**
   * Associates a token with a Hedera account by calling a Supabase Edge Function.
   * @param accountId The account ID to associate the token with.
   * @param tokenId The ID of the token to associate.
   * @param privateKey The private key of the account (passed to edge function).
   * @returns The transaction ID.
   */
  async associateToken(accountId: string | AccountId, tokenId: string, privateKey: PrivateKey): Promise<string> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/associate-hedera-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: accountId.toString(),
        tokenId,
        privateKey: privateKey.toString(),
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to associate Hedera token via Edge Function.");
    }
    return result.data.transactionId;
  }
}
