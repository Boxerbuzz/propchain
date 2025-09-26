import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { HEDERA_WALLETS } from '@/lib/walletConnect';
import { useHederaAccount } from '@/hooks/useHederaAccount';

const ConnectWallet = () => {
  const { connectExternalWallet, isConnecting, selectedWallet, hasExternalWallet } = useWalletConnect();
  const { createAccount, isCreating, hasAccount } = useHederaAccount();

  const hederaWallets = [
    {
      id: 'hashpack',
      name: 'HashPack',
      icon: '🔗',
      description: 'The most popular Hedera wallet',
      isAvailable: true
    },
    {
      id: 'blade', 
      name: 'Blade Wallet',
      icon: '⚔️',
      description: 'Secure Hedera wallet with DeFi features',
      isAvailable: true
    }
  ];

  const handleConnect = async (method: string) => {
    if (method === 'custodial') {
      createAccount();
    } else if (hederaWallets.find(w => w.id === method)) {
      await connectExternalWallet(method);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/wallet/setup">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">PropChain</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to connect your wallet to PropChain. Connect an existing Hedera wallet or create a custodial wallet.
          </p>
        </div>

        {hasExternalWallet && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              External wallet connected successfully! You can now use your wallet with PropChain.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8">
          {/* Custodial Wallet */}
          <div>
            <h3 className="text-xl font-semibold mb-4">PropChain Wallet</h3>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <CardTitle className="text-lg">Custodial Wallet</CardTitle>
                    <CardDescription>Easy to use, managed by PropChain</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleConnect('custodial')}
                  disabled={isCreating || hasAccount}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : hasAccount ? 'Already Created' : 'Create Wallet'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Hedera Wallets */}
          <div>
            <h3 className="text-xl font-semibold mb-4">External Wallets</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {hederaWallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <CardDescription>{wallet.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleConnect(wallet.id)}
                      disabled={isConnecting && selectedWallet === wallet.id}
                      className="w-full"
                    >
                      {isConnecting && selectedWallet === wallet.id ? 'Connecting...' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;