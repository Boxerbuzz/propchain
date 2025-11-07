import { 
  Client, 
  ContractId, 
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountId,
  PrivateKey,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

export interface ContractConfig {
  contract_address: string;
  abi: any;
  contract_version: string;
  deployment_network: string;
}

export class SmartContractService {
  private client: Client;
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    
    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');
    
    if (!operatorId || !operatorKey) {
      throw new Error('Hedera operator credentials not configured');
    }
    
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromStringECDSA(operatorKey)
    );
  }

  async getContractConfig(contractName: string): Promise<ContractConfig> {
    const { data, error } = await this.supabase
      .from('smart_contract_config')
      .select('*')
      .eq('contract_name', contractName)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error(`Contract ${contractName} not found or not active`);
    }

    return data;
  }

  async executeContractFunction(
    contractName: string,
    functionName: string,
    params: ContractFunctionParameters,
    gas: number = 1000000
  ): Promise<string> {
    const config = await this.getContractConfig(contractName);
    const contractId = ContractId.fromSolidityAddress(config.contract_address);

    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gas)
      .setFunction(functionName, params);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    console.log(`✅ Contract ${contractName}.${functionName} executed:`, txResponse.transactionId.toString());

    return txResponse.transactionId.toString();
  }

  async registerProposalOnChain(data: {
    proposalId: string;
    propertyTreasuryAddress: string;
    budget: number;
    proposalType: string;
    votingEnd: number;
  }): Promise<{ txHash: string; contractAddress: string; proposalId: string }> {
    console.log('📝 Registering proposal on GovernanceExecutor contract...');
    
    const params = new ContractFunctionParameters()
      .addBytes32(Buffer.from(data.proposalId.substring(0, 64), 'utf8'))
      .addAddress(data.propertyTreasuryAddress)
      .addUint256(data.budget)
      .addUint8(this.getProposalTypeEnum(data.proposalType))
      .addUint256(data.votingEnd);

    const txHash = await this.executeContractFunction(
      'governance_executor',
      'registerProposal',
      params
    );

    const config = await this.getContractConfig('governance_executor');

    return {
      txHash,
      contractAddress: config.contract_address,
      proposalId: data.proposalId
    };
  }

  async executeProposalOnChain(data: {
    proposalId: string;
  }): Promise<{ txHash: string; contractAddress: string }> {
    console.log('⚡ Executing proposal on GovernanceExecutor contract...');
    
    const params = new ContractFunctionParameters()
      .addBytes32(Buffer.from(data.proposalId.substring(0, 64), 'utf8'));

    const txHash = await this.executeContractFunction(
      'governance_executor',
      'lockFundsForProposal',
      params,
      2000000 // Higher gas for fund operations
    );

    const config = await this.getContractConfig('governance_executor');

    return {
      txHash,
      contractAddress: config.contract_address
    };
  }

  async createDistributionOnChain(data: {
    distributionId: string;
    tokenContract: string;
    totalAmount: number;
    perTokenAmount: number;
    snapshotBlock: number;
  }): Promise<{ txHash: string; contractAddress: string; distributionId: string }> {
    console.log('📊 Creating distribution on DividendDistributor contract...');
    
    const params = new ContractFunctionParameters()
      .addBytes32(Buffer.from(data.distributionId.substring(0, 64), 'utf8'))
      .addAddress(data.tokenContract)
      .addUint256(data.totalAmount)
      .addUint256(data.perTokenAmount)
      .addUint256(data.snapshotBlock)
      .addUint256(30); // 30 days expiry

    const txHash = await this.executeContractFunction(
      'dividend_distributor',
      'createDistribution',
      params,
      1500000
    );

    const config = await this.getContractConfig('dividend_distributor');

    return {
      txHash,
      contractAddress: config.contract_address,
      distributionId: data.distributionId
    };
  }

  async claimDividendOnChain(data: {
    distributionId: string;
  }): Promise<{ txHash: string; contractAddress: string }> {
    console.log('💰 Claiming dividend from DividendDistributor contract...');
    
    const params = new ContractFunctionParameters()
      .addBytes32(Buffer.from(data.distributionId.substring(0, 64), 'utf8'));

    const txHash = await this.executeContractFunction(
      'dividend_distributor',
      'claimDividend',
      params,
      1000000
    );

    const config = await this.getContractConfig('dividend_distributor');

    return {
      txHash,
      contractAddress: config.contract_address
    };
  }

  async deployMultiSigTreasury(data: {
    signers: string[];
    threshold: number;
  }): Promise<{ contractAddress: string; txHash: string }> {
    console.log('🏦 Deploying MultiSigTreasury contract...');
    
    // Note: This would use ContractCreateTransaction in real implementation
    // For now, returning simulated values until deployment script is run
    throw new Error('MultiSig deployment must be done through deployment script');
  }

  async submitTreasuryWithdrawal(data: {
    treasuryAddress: string;
    recipient: string;
    amount: number;
    reason: string;
  }): Promise<{ txHash: string; requestId: string }> {
    console.log('📤 Submitting treasury withdrawal to MultiSigTreasury...');
    
    const params = new ContractFunctionParameters()
      .addAddress(data.recipient)
      .addUint256(data.amount)
      .addString(data.reason);

    // Use treasury address directly as it's a deployed instance
    const contractId = ContractId.fromSolidityAddress(data.treasuryAddress);
    
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1500000)
      .setFunction('submitWithdrawal', params);

    const txResponse = await transaction.execute(this.client);
    await txResponse.getReceipt(this.client);

    const txHash = txResponse.transactionId.toString();
    
    return {
      txHash,
      requestId: txHash // Use tx hash as request ID
    };
  }

  async approveTreasuryWithdrawal(data: {
    treasuryAddress: string;
    requestId: number;
  }): Promise<{ txHash: string; executed: boolean }> {
    console.log('✅ Approving treasury withdrawal on MultiSigTreasury...');
    
    const params = new ContractFunctionParameters()
      .addUint256(data.requestId);

    const contractId = ContractId.fromSolidityAddress(data.treasuryAddress);
    
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(2000000) // Higher gas as it might auto-execute
      .setFunction('approveWithdrawal', params);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return {
      txHash: txResponse.transactionId.toString(),
      executed: receipt.status.toString() === 'SUCCESS'
    };
  }

  async getLatestBlockNumber(): Promise<number> {
    const mirrorNodeUrl = Deno.env.get('HEDERA_MIRROR_NODE_URL') || 'https://testnet.mirrornode.hedera.com';
    const response = await fetch(`${mirrorNodeUrl}/api/v1/blocks?order=desc&limit=1`);
    const data = await response.json();
    
    if (data.blocks && data.blocks.length > 0) {
      return data.blocks[0].number;
    }
    
    return 0;
  }

  private getProposalTypeEnum(type: string): number {
    const types: Record<string, number> = {
      'maintenance': 0,
      'improvement': 1,
      'financial': 2,
      'governance': 3
    };
    return types[type] || 0;
  }
}
