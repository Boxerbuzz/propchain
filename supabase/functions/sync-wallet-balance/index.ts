// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Client, AccountBalanceQuery } from "https://esm.sh/@hashgraph/sdk@2.73.2"

//2.73.2
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

    const balanceHbar = Number(hbarBalance.toString()) / 100000000; // Convert tinybars to HBAR

    // Fetch real exchange rates
    let balanceUsd = 0;
    let balanceNgn = 0;

    try {
      // Get HBAR/USD rate from CoinGecko
      const hbarResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
      const hbarData = await hbarResponse.json();
      const hbarToUsd = hbarData['hedera-hashgraph']?.usd || 0.05; // Fallback to mock rate

      // Get USD/NGN rate
      const usdResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn');
      const usdData = await usdResponse.json();
      const usdToNgn = usdData.tether?.ngn || 1500; // Fallback to mock rate

      balanceUsd = balanceHbar * hbarToUsd;
      balanceNgn = balanceUsd * usdToNgn;

      console.log(`Exchange rates - HBAR/USD: ${hbarToUsd}, USD/NGN: ${usdToNgn}`);
    } catch (error) {
      console.error('Failed to fetch exchange rates, using fallbacks:', error);
      // Use fallback rates if API fails
      balanceUsd = balanceHbar * 0.05;
      balanceNgn = balanceUsd * 1500;
    }

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