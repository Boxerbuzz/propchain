import {
  Client,
  PrivateKey,
  AccountId,
  Hbar,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountBalanceQuery,
  FileCreateTransaction,
  FileAppendTransaction,
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

  /**
   * Gets the balance of a token in a Hedera account.
   * @param accountId The account ID to query.
   * @param tokenId The ID of the token to query.
   * @returns The balance of the token.
   */
  async getTokenBalance(accountId: string | AccountId, tokenId: string): Promise<number> {
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId.toString()));
    const accountBalance = await balanceQuery.execute(this.client);
    console.log(`Account ${accountId} Token ${tokenId} Balance: ${accountBalance.hbars.toString()}`);
    return accountBalance.hbars.toTinybars().toNumber();
  }

  /**
   * Uploads a file to Hedera File Service (HFS).
   * @param file The file to upload.
   * @param fileName The name of the file.
   * @param propertyId The property ID for the memo.
   * @returns Object containing the HFS file ID and file hash.
   */
  async uploadToHFS(file: File, fileName: string, propertyId: string): Promise<{ fileId: string; fileHash: string }> {
    const startTime = Date.now();
    console.log(`[HFS] Uploading file: ${fileName} for property: ${propertyId}`);
    console.log(`[HFS] File size: ${file.size} bytes`);

    // Convert file to bytes
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    console.log(`[HFS] Converted file to ${fileBytes.length} bytes`);

    // Generate file hash for verification
    const hashBuffer = await crypto.subtle.digest("SHA-256", fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    console.log(`[HFS] Generated file hash: ${fileHash}`);

    // Create file memo (truncated to fit Hedera's 100 character limit)
    const shortPropertyId = propertyId.substring(0, 8);
    const memo = `PropChain: ${fileName.substring(0, 70)} (${shortPropertyId})`;
    console.log(`[HFS] File memo: "${memo}"`);

    try {
      // Create initial file with empty content
      const fileCreateStart = Date.now();
      const fileCreateTx = new FileCreateTransaction()
        .setKeys([this.client.operatorPublicKey!])
        .setMaxTransactionFee(new Hbar(10))
        .setFileMemo(memo);

      const fileCreateResponse = await fileCreateTx.execute(this.client);
      const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
      const fileId = fileCreateReceipt.fileId;

      if (!fileId) {
        throw new Error("Failed to get file ID from file creation receipt");
      }

      const fileCreateTime = Date.now() - fileCreateStart;
      console.log(`[HFS] ✅ File created on HFS: ${fileId.toString()} (${fileCreateTime}ms)`);

      // Upload file in chunks (max 1024 bytes per chunk)
      const chunkUploadStart = Date.now();
      const chunkSize = 1024;
      const totalChunks = Math.ceil(fileBytes.length / chunkSize);
      console.log(`[HFS] Uploading file in ${totalChunks} chunks of ${chunkSize} bytes each`);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, fileBytes.length);
        const chunk = fileBytes.slice(start, end);

        const appendTx = new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(5));

        await appendTx.execute(this.client);
        
        if ((i + 1) % 10 === 0 || i === totalChunks - 1) {
          const chunkTime = Date.now() - chunkUploadStart;
          const avgChunkTime = chunkTime / (i + 1);
          console.log(`[HFS] Uploaded chunk ${i + 1}/${totalChunks} (${chunk.length} bytes) - Avg: ${avgChunkTime.toFixed(0)}ms/chunk`);
        }
      }

      const chunkUploadTime = Date.now() - chunkUploadStart;
      console.log(`[HFS] ✅ All chunks uploaded in ${chunkUploadTime}ms`);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const totalTimeSeconds = (totalTime / 1000).toFixed(2);
      const totalTimeMinutes = (totalTime / 60000).toFixed(2);
      
      console.log(`[HFS] ✅ File upload complete: ${fileName} -> ${fileId.toString()}`);
      console.log(`[HFS] ⏱️ Upload completed in ${totalTime}ms (${totalTimeSeconds}s / ${totalTimeMinutes}min)`);
      
      return {
        fileId: fileId.toString(),
        fileHash: fileHash
      };

    } catch (error: any) {
      console.error(`[HFS] ❌ Failed to upload file to HFS:`, error);
      throw new Error(`Failed to upload file to HFS: ${error.message}`);
    }
  }

  /**
   * Takes a file, hashes it, and uploads only the hash to Hedera File Service (HFS).
   * @param file The file to hash and upload the hash.
   * @param fileName The name of the file.
   * @param propertyId The property ID for the memo.
   * @returns Object containing the HFS file ID and the generated file hash.
   */
  async uploadFileHashToHFS(file: File, fileName: string, propertyId: string): Promise<{ fileId: string; fileHash: string }> {
    const startTime = Date.now();
    console.log(`[HFS-HASH] Processing file: ${fileName} (property: ${propertyId})`);
    console.log(`[HFS-HASH] File size: ${file.size} bytes`);

    // Convert file to bytes and generate hash
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    console.log(`[HFS-HASH] Converted file to ${fileBytes.length} bytes`);

    // Generate file hash for verification
    const hashBuffer = await crypto.subtle.digest("SHA-256", fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    console.log(`[HFS-HASH] Generated file hash: ${fileHash}`);

    // Create file memo (truncated to fit Hedera's 100 character limit)
    const shortPropertyId = propertyId.substring(0, 8);
    const memo = `PropChain-HASH: ${fileName.substring(0, 60)} (${shortPropertyId})`;
    console.log(`[HFS-HASH] File memo: "${memo}"`);

    try {
      // Convert hash string to bytes
      const hashBytes = new TextEncoder().encode(fileHash);
      console.log(`[HFS-HASH] Hash as bytes: ${hashBytes.length} bytes`);

      // Create initial file with empty content
      const fileCreateStart = Date.now();
      const fileCreateTx = new FileCreateTransaction()
        .setKeys([this.client.operatorPublicKey!])
        .setMaxTransactionFee(new Hbar(5))
        .setFileMemo(memo);

      const fileCreateResponse = await fileCreateTx.execute(this.client);
      const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
      const fileId = fileCreateReceipt.fileId;

      if (!fileId) {
        throw new Error("Failed to get file ID from file creation receipt");
      }

      const fileCreateTime = Date.now() - fileCreateStart;
      console.log(`[HFS-HASH] ✅ File created on HFS: ${fileId.toString()} (${fileCreateTime}ms)`);

      // Upload hash as content
      const hashUploadStart = Date.now();
      const appendTx = new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(hashBytes)
        .setMaxTransactionFee(new Hbar(2));

      await appendTx.execute(this.client);
      const hashUploadTime = Date.now() - hashUploadStart;
      
      console.log(`[HFS-HASH] ✅ Hash uploaded in ${hashUploadTime}ms`);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const totalTimeSeconds = (totalTime / 1000).toFixed(2);
      
      console.log(`[HFS-HASH] ✅ Hash upload complete: ${fileName} -> ${fileId.toString()}`);
      console.log(`[HFS-HASH] ⏱️ Upload completed in ${totalTime}ms (${totalTimeSeconds}s)`);
      
      return {
        fileId: fileId.toString(),
        fileHash: fileHash
      };

    } catch (error: any) {
      console.error(`[HFS-HASH] ❌ Failed to upload hash to HFS:`, error);
      throw new Error(`Failed to upload hash to HFS: ${error.message}`);
    }
  }
}
