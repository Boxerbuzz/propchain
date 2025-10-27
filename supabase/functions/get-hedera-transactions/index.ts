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

    // Token info cache to avoid duplicate API calls
    const tokenInfoCache = new Map<string, { symbol: string; decimals: number }>();

    // Transform Hedera transactions to our format
    const transformedTransactions = await Promise.all(
      (data.transactions || []).map(async (tx: HederaTransaction) => {
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
          
          // Check if this is USDC token
          const usdcTokenId = Deno.env.get('HEDERA_USDC_TOKEN_ID') || '0.0.429274'; // Testnet USDC
          console.log('Using USDC token ID for transactions:', usdcTokenId);
          
          if (tokenTransfer.token_id === usdcTokenId) {
            // USDC has 6 decimals
            amount = amount / 1_000_000;
            currency = 'USDC';
          } else {
            // Try to fetch token info for custom tokens
            currency = tokenTransfer.token_id;
            try {
              let tokenInfo = tokenInfoCache.get(tokenTransfer.token_id);
              if (!tokenInfo) {
                const tokenInfoResponse = await fetch(
                  `${mirrorNodeUrl}/api/v1/tokens/${tokenTransfer.token_id}`
                );
                if (tokenInfoResponse.ok) {
                  const data = await tokenInfoResponse.json();
                  tokenInfo = { 
                    symbol: data.symbol || tokenTransfer.token_id, 
                    decimals: data.decimals || 0 
                  };
                  tokenInfoCache.set(tokenTransfer.token_id, tokenInfo);
                }
              }
              if (tokenInfo) {
                currency = tokenInfo.symbol;
                // Apply decimals if available
                if (tokenInfo.decimals > 0) {
                  amount = amount / Math.pow(10, tokenInfo.decimals);
                }
              }
            } catch (e) {
              console.warn(`Failed to fetch token info for ${tokenTransfer.token_id}`, e);
            }
          }
          
          type = amount > 0 ? 'token_deposit' : 'token_withdrawal';
        }

        const isIncoming = amount >= 0;
        const isFailed = tx.result !== 'SUCCESS';
        const absoluteAmount = Math.abs(amount);
        
        // Find the other party in the transfer
        let otherParty = 'Unknown';
        if (accountTransfer) {
          const otherTransfer = tx.transfers?.find(t => t.account !== hederaAccountId);
          otherParty = otherTransfer?.account || 'Unknown';
        }
        if (tokenTransfer) {
          const otherTransfer = tx.token_transfers?.find(t => t.account !== hederaAccountId);
          otherParty = otherTransfer?.account || 'Unknown';
        }
        
        // Determine displayType for frontend
        let displayType: 'send' | 'receive' | 'swap' | 'internal' = 'internal';
        if (type === 'deposit' || type === 'token_deposit') {
          displayType = 'receive';
        } else if (type === 'withdrawal' || type === 'token_withdrawal') {
          displayType = 'send';
        }
        
        // Create description based on transaction type and direction
        let description = '';
        if (tokenTransfer) {
          // Token transaction
          description = `${isIncoming ? 'Received' : 'Sent'} ${absoluteAmount} ${currency}`;
        } else {
          // HBAR transaction
          description = `${isIncoming ? 'Received' : 'Sent'} ${absoluteAmount} HBAR`;
        }
        
        if (isFailed) {
          description += ' (Failed)';
        }

        return {
          id: tx.transaction_id,
          hash: tx.transaction_id,
          type,
          displayType,
          amount: absoluteAmount,
          currency,
          status: isFailed ? 'failed' : 'completed',
          timestamp: new Date(parseFloat(tx.consensus_timestamp) * 1000).toISOString(),
          date: new Date(parseFloat(tx.consensus_timestamp) * 1000).toISOString().split('T')[0],
          fee: tx.transaction_fee / 100000000, // Convert from tinybars to HBAR
          method: 'Hedera Network',
          direction: isIncoming ? 'incoming' : 'outgoing',
          description,
          explorerUrl: `https://hashscan.io/testnet/transaction/${tx.transaction_id}`,
          from: isIncoming ? otherParty : hederaAccountId,
          to: isIncoming ? hederaAccountId : otherParty,
        };
      })
    );

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