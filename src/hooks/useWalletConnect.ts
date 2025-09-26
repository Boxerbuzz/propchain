import { useState, useEffect, useCallback } from 'react';
import { hederaWalletConnect, HEDERA_WALLETS } from '@/lib/walletConnect';
import { useHederaAccount } from './useHederaAccount';
import { toast } from 'sonner';

export interface ConnectedWallet {
  type: 'custodial' | 'external';
  name: string;
  address: string;
  walletProvider?: string;
  connected: boolean;
}

export const useWalletConnect = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  const { hederaAccount, hasAccount } = useHederaAccount();

  useEffect(() => {
    // Initialize wallets list
    const wallets: ConnectedWallet[] = [];
    
    // Add custodial wallet if exists
    if (hasAccount && hederaAccount) {
      wallets.push({
        type: 'custodial',
        name: 'PropChain Wallet',
        address: hederaAccount,
        connected: true
      });
    }

    // Check for existing external wallet connections
    const externalAccount = hederaWalletConnect.getConnectedAccount();
    const externalWallet = hederaWalletConnect.getConnectedWallet();
    
    if (externalAccount && externalWallet) {
      const walletInfo = HEDERA_WALLETS[externalWallet];
      wallets.push({
        type: 'external',
        name: walletInfo?.name || externalWallet,
        address: externalAccount,
        walletProvider: externalWallet,
        connected: true
      });
    }

    setConnectedWallets(wallets);
  }, [hederaAccount, hasAccount]);

  const connectExternalWallet = useCallback(async (walletType: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletType);

    try {
      const result = await hederaWalletConnect.connectWallet(walletType);
      
      if (result.success && result.account) {
        const walletInfo = HEDERA_WALLETS[walletType];
        const newWallet: ConnectedWallet = {
          type: 'external',
          name: walletInfo?.name || walletType,
          address: result.account,
          walletProvider: walletType,
          connected: true
        };

        setConnectedWallets(prev => [...prev.filter(w => w.type === 'custodial'), newWallet]);
        
        toast.success(`${walletInfo?.name || walletType} connected successfully!`);
        return { success: true, wallet: newWallet };
      } else {
        toast.error(result.error || 'Failed to connect wallet');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to connect wallet: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  }, []);

  const disconnectExternalWallet = useCallback(async () => {
    try {
      await hederaWalletConnect.disconnectWallet();
      setConnectedWallets(prev => prev.filter(w => w.type === 'custodial'));
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  }, []);

  const getActiveWallet = useCallback((): ConnectedWallet | null => {
    // Prioritize external wallet if connected
    const externalWallet = connectedWallets.find(w => w.type === 'external' && w.connected);
    if (externalWallet) return externalWallet;
    
    // Fallback to custodial wallet
    const custodialWallet = connectedWallets.find(w => w.type === 'custodial' && w.connected);
    return custodialWallet || null;
  }, [connectedWallets]);

  const sendTransaction = useCallback(async (transaction: any) => {
    const activeWallet = getActiveWallet();
    
    if (!activeWallet) {
      throw new Error('No wallet connected');
    }

    if (activeWallet.type === 'external') {
      // Use WalletConnect for external wallets
      return await hederaWalletConnect.sendTransaction(transaction);
    } else {
      // Use custodial wallet service for internal wallets
      throw new Error('Custodial wallet transactions not implemented yet');
    }
  }, [getActiveWallet]);

  return {
    connectedWallets,
    isConnecting,
    selectedWallet,
    connectExternalWallet,
    disconnectExternalWallet,
    getActiveWallet,
    sendTransaction,
    hasExternalWallet: connectedWallets.some(w => w.type === 'external' && w.connected),
    hasCustodialWallet: connectedWallets.some(w => w.type === 'custodial' && w.connected)
  };
};