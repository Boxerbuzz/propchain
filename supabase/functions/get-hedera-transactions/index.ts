import { serve } from "https://deno.land/std@0.178.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HederaTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  type: string;
  result: string;
  transfers: Array<{
    account: string;
    amount: number;
  }>;
  token_transfers?: Array<{
    account: string;
    token_id: string;
    amount: number;
  }>;
  transaction_fee: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hederaAccountId } = await req.json();
    
    if (!hederaAccountId) {
      return new Response(
        JSON.stringify({ error: 'Hedera account ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching transactions for account: ${hederaAccountId}`);
    
    // Get mirror node URL from environment
    const mirrorNodeUrl = Deno.env.get('HEDERA_MIRROR_NODE_URL') || 'https://testnet.mirrornode.hedera.com';
    
    // Fetch transactions from Hedera Mirror Node
    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/transactions?account.id=${hederaAccountId}&limit=50&order=desc`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Mirror node request failed: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transactions from Hedera network' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.transactions?.length || 0} transactions`);

    // Transform Hedera transactions to our format
    const transformedTransactions = (data.transactions || []).map((tx: HederaTransaction) => {
      // Find transfer involving this account
      const accountTransfer = tx.transfers?.find(transfer => 
        transfer.account === hederaAccountId
      );
      
      const tokenTransfer = tx.token_transfers?.find(transfer => 
        transfer.account === hederaAccountId
      );

      // Determine transaction type and amount
      let type = 'unknown';
      let amount = 0;
      let currency = 'HBAR';
      
      if (accountTransfer) {
        amount = accountTransfer.amount / 100000000; // Convert from tinybars to HBAR
        type = amount > 0 ? 'deposit' : 'withdrawal';
      }
      
      if (tokenTransfer) {
        // Token transaction
        amount = tokenTransfer.amount;
        currency = tokenTransfer.token_id;
        type = amount > 0 ? 'token_deposit' : 'token_withdrawal';
      }

      return {
        id: tx.transaction_id,
        hash: tx.transaction_id,
        type,
        amount: Math.abs(amount),
        currency,
        status: tx.result === 'SUCCESS' ? 'completed' : 'failed',
        timestamp: new Date(parseFloat(tx.consensus_timestamp) * 1000).toISOString(),
        date: new Date(parseFloat(tx.consensus_timestamp) * 1000).toISOString().split('T')[0],
        fee: tx.transaction_fee / 100000000, // Convert from tinybars to HBAR
        method: 'Hedera Network',
        direction: amount >= 0 ? 'incoming' : 'outgoing',
        explorerUrl: `https://hashscan.io/testnet/transaction/${tx.transaction_id}`
      };
    });

    console.log(`Transformed ${transformedTransactions.length} transactions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions: transformedTransactions,
        account: hederaAccountId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching Hedera transactions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});