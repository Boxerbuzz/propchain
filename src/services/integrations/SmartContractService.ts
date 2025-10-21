import { Client, ContractId, ContractExecuteTransaction, ContractCallQuery, AccountId, PrivateKey } from "@hashgraph/sdk";
import { hederaClient } from "../../lib/hedera";
import { supabase } from "@/integrations/supabase/client";

export interface ContractConfig {
  contract_address: string;
  abi: any;
  contract_version: string;
  deployment_network: string;
}

export interface ContractTransactionResult {
  txHash: string;
  contractAddress: string;
  proposalId?: string;
  distributionId?: string;
  requestId?: string;
}

export class SmartContractService {
  private client: Client;

  constructor() {
    this.client = hederaClient;
  }

  /**
   * Fetch contract configuration from Supabase
   */
  async getContractConfig(contractName: string): Promise<ContractConfig> {
    const { data, error } = await supabase
      .from('smart_contract_config' as any)
      .select('*')
      .eq('contract_name', contractName)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error(`Contract ${contractName} not found or not active`);
    }

    return data as any as ContractConfig;
  }

  /**
   * Generic contract function execution
   */
  async executeContractFunction(
    contractName: string,
    functionName: string,
    params: any,
    gas: number = 1000000
  ): Promise<string> {
    try {
      const config = await this.getContractConfig(contractName);
      const contractId = ContractId.fromString(config.contract_address);

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gas)
        .setFunction(functionName, params);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`Contract ${contractName}.${functionName} executed:`, txResponse.transactionId.toString());

      return txResponse.transactionId.toString();
    } catch (error: any) {
      console.error(`Failed to execute ${contractName}.${functionName}:`, error);
      throw new Error(`Contract execution failed: ${error.message}`);
    }
  }

  /**
   * Get transaction status from Hedera
   */
  async getTransactionStatus(txHash: string): Promise<string> {
    try {
      // Query Hedera Mirror Node for transaction status
      const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
      const response = await fetch(`${mirrorNodeUrl}/api/v1/transactions/${txHash}`);
      
      if (!response.ok) {
        return 'pending';
      }

      const data = await response.json();
      return data.result === 'SUCCESS' ? 'confirmed' : 'failed';
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return 'pending';
    }
  }

  /**
   * Estimate gas for contract function
   */
  async estimateGas(
    contractName: string,
    functionName: string,
    params: any[]
  ): Promise<number> {
    // Basic gas estimation - can be enhanced with actual queries
    const baseGas = 100000;
    const complexityMultiplier = params.length * 10000;
    return baseGas + complexityMultiplier;
  }

  /**
   * Register proposal on GovernanceExecutor contract
   */
  async registerProposalOnChain(data: {
    proposalId: string;
    propertyTreasuryAddress: string;
    budget: number;
    proposalType: string;
    votingEnd: number;
  }): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'governance_executor',
        'registerProposal',
        [
          data.proposalId,
          data.propertyTreasuryAddress,
          data.budget,
          data.proposalType,
          data.votingEnd
        ]
      );

      const config = await this.getContractConfig('governance_executor');

      return {
        txHash,
        contractAddress: config.contract_address,
        proposalId: data.proposalId
      };
    } catch (error: any) {
      throw new Error(`Failed to register proposal on-chain: ${error.message}`);
    }
  }

  /**
   * Execute proposal on GovernanceExecutor contract
   */
  async executeProposalOnChain(proposalId: string): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'governance_executor',
        'executeProposal',
        [proposalId],
        1500000
      );

      const config = await this.getContractConfig('governance_executor');

      return {
        txHash,
        contractAddress: config.contract_address,
        proposalId
      };
    } catch (error: any) {
      throw new Error(`Failed to execute proposal on-chain: ${error.message}`);
    }
  }

  /**
   * Create distribution on DividendDistributor contract
   */
  async createDistributionOnChain(data: {
    distributionId: string;
    tokenContract: string;
    totalAmount: number;
    perTokenAmount: number;
    snapshotBlock: number;
  }): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'dividend_distributor',
        'createDistribution',
        [
          data.distributionId,
          data.tokenContract,
          data.totalAmount,
          data.perTokenAmount,
          data.snapshotBlock
        ]
      );

      const config = await this.getContractConfig('dividend_distributor');

      return {
        txHash,
        contractAddress: config.contract_address,
        distributionId: data.distributionId
      };
    } catch (error: any) {
      throw new Error(`Failed to create distribution on-chain: ${error.message}`);
    }
  }

  /**
   * Claim dividend from DividendDistributor contract
   */
  async claimDividendOnChain(distributionId: string, userId: string): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'dividend_distributor',
        'claimDividend',
        [distributionId, userId],
        800000
      );

      const config = await this.getContractConfig('dividend_distributor');

      return {
        txHash,
        contractAddress: config.contract_address,
        distributionId
      };
    } catch (error: any) {
      throw new Error(`Failed to claim dividend on-chain: ${error.message}`);
    }
  }

  /**
   * Submit treasury withdrawal to MultiSigTreasury contract
   */
  async submitTreasuryWithdrawal(
    treasuryAddress: string,
    amount: number,
    recipient: string,
    description: string
  ): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'multisig_treasury',
        'submitWithdrawal',
        [amount, recipient, description]
      );

      return {
        txHash,
        contractAddress: treasuryAddress
      };
    } catch (error: any) {
      throw new Error(`Failed to submit treasury withdrawal: ${error.message}`);
    }
  }

  /**
   * Approve treasury withdrawal on MultiSigTreasury contract
   */
  async approveTreasuryWithdrawal(
    treasuryAddress: string,
    requestId: string
  ): Promise<ContractTransactionResult> {
    try {
      const txHash = await this.executeContractFunction(
        'multisig_treasury',
        'approveWithdrawal',
        [requestId]
      );

      return {
        txHash,
        contractAddress: treasuryAddress,
        requestId
      };
    } catch (error: any) {
      throw new Error(`Failed to approve treasury withdrawal: ${error.message}`);
    }
  }

  /**
   * Get latest block number from Hedera Mirror Node
   */
  async getLatestBlockNumber(): Promise<number> {
    try {
      const mirrorNodeUrl = import.meta.env.VITE_HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
      const response = await fetch(`${mirrorNodeUrl}/api/v1/blocks?order=desc&limit=1`);
      const data = await response.json();
      
      if (data.blocks && data.blocks.length > 0) {
        return data.blocks[0].number;
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get latest block number:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();
