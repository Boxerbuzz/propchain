import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Client, AccountBalanceQuery, Hbar } from "npm:@hashgraph/sdk@^2.73.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { hederaAccountId } = await req.json();

    if (!hederaAccountId) {
      return new Response(
        JSON.stringify({ error: 'Hedera account ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorPrivateKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorPrivateKey) {
      console.error('Missing Hedera operator credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Hedera configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Hedera client for testnet
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorPrivateKey);

    console.log(`Querying balance for account: ${hederaAccountId}`);

    // Query account balance
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(hederaAccountId);

    const balance = await balanceQuery.execute(client);
    const hbarBalance = balance.hbars.toTinybars();

    console.log(`Account ${hederaAccountId} balance: ${balance.hbars.toString()}`);

    // Convert to different currencies (simplified conversion)
    const hbarToUsd = 0.05; // Mock exchange rate - should be fetched from an API
    const usdToNgn = 1500;  // Mock exchange rate - should be fetched from an API

    const balanceHbar = Number(hbarBalance.toString()) / 100000000; // Convert tinybars to HBAR
    const balanceUsd = balanceHbar * hbarToUsd;
    const balanceNgn = balanceUsd * usdToNgn;

    const result = {
      hederaAccountId,
      balanceHbar: balanceHbar,
      balanceUsd: balanceUsd,
      balanceNgn: balanceNgn,
      lastSyncAt: new Date().toISOString(),
      tokens: balance.tokens ? Object.fromEntries(balance.tokens) : {},
    };

    console.log('Balance sync completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error syncing wallet balance:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync wallet balance',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});