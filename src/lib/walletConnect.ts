export interface HederaWalletInfo {
  name: string;
  icon: string;
  description: string;
}

export const HEDERA_WALLETS: Record<string, HederaWalletInfo> = {
  hashpack: {
    name: 'HashPack',
    icon: '🔗',
    description: 'The most popular Hedera wallet'
  },
  blade: {
    name: 'Blade Wallet',
    icon: '⚔️',
    description: 'Secure Hedera wallet with DeFi features'
  }
};

class HederaWalletConnect {
  private connectedAccount: string | null = null;
  private connectedWallet: string | null = null;

  constructor() {
    // Initialize connection state from localStorage if available
    this.connectedAccount = localStorage.getItem('hedera_connected_account');
    this.connectedWallet = localStorage.getItem('hedera_connected_wallet');
  }

  async connectWallet(walletType: string): Promise<{ success: boolean; account?: string; error?: string }> {
    try {
      // For HashPack
      if (walletType === 'hashpack') {
        if (typeof window !== 'undefined' && (window as any).hashpack) {
          const hashpack = (window as any).hashpack;
          const result = await hashpack.connectToLocalWallet();
          
          if (result.success) {
            this.connectedAccount = result.accountIds[0];
            this.connectedWallet = walletType;
            
            // Persist connection
            localStorage.setItem('hedera_connected_account', this.connectedAccount);
            localStorage.setItem('hedera_connected_wallet', this.connectedWallet);
            
            return { success: true, account: this.connectedAccount };
          } else {
            return { success: false, error: result.error || 'Connection failed' };
          }
        } else {
          // HashPack not detected - provide install link
          return { success: false, error: 'HashPack wallet not found. Please install HashPack extension.' };
        }
      }
      
      // For Blade Wallet
      if (walletType === 'blade') {
        if (typeof window !== 'undefined' && (window as any).bladeAPI) {
          const blade = (window as any).bladeAPI;
          const result = await blade.getInfo();
          
          if (result.success) {
            this.connectedAccount = result.accountId;
            this.connectedWallet = walletType;
            
            // Persist connection
            localStorage.setItem('hedera_connected_account', this.connectedAccount);
            localStorage.setItem('hedera_connected_wallet', this.connectedWallet);
            
            return { success: true, account: this.connectedAccount };
          } else {
            return { success: false, error: result.error || 'Connection failed' };
          }
        } else {
          // Blade not detected - provide install link
          return { success: false, error: 'Blade wallet not found. Please install Blade wallet.' };
        }
      }

      return { success: false, error: 'Unsupported wallet type' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connectedAccount = null;
    this.connectedWallet = null;
    
    // Clear persisted connection
    localStorage.removeItem('hedera_connected_account');
    localStorage.removeItem('hedera_connected_wallet');
  }

  getConnectedAccount(): string | null {
    return this.connectedAccount;
  }

  getConnectedWallet(): string | null {
    return this.connectedWallet;
  }

  isConnected(): boolean {
    return !!this.connectedAccount;
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.connectedAccount || !this.connectedWallet) {
      throw new Error('No wallet connected');
    }

    if (this.connectedWallet === 'hashpack') {
      const hashpack = (window as any).hashpack;
      if (hashpack) {
        const result = await hashpack.sendTransaction(transaction);
        if (result.success) {
          return result.receipt;
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      }
    }

    if (this.connectedWallet === 'blade') {
      const blade = (window as any).bladeAPI;
      if (blade) {
        const result = await blade.sendTransaction(transaction);
        if (result.success) {
          return result.transactionId;
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      }
    }

    throw new Error('Transaction method not supported');
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connectedAccount || !this.connectedWallet) {
      throw new Error('No wallet connected');
    }

    if (this.connectedWallet === 'hashpack') {
      const hashpack = (window as any).hashpack;
      if (hashpack) {
        const result = await hashpack.sign(message);
        if (result.success) {
          return result.signature;
        } else {
          throw new Error(result.error || 'Signing failed');
        }
      }
    }

    if (this.connectedWallet === 'blade') {
      const blade = (window as any).bladeAPI;
      if (blade) {
        const result = await blade.sign(message, this.connectedAccount);
        if (result.success) {
          return result.signature;
        } else {
          throw new Error(result.error || 'Signing failed');
        }
      }
    }

    throw new Error('Signing method not supported');
  }
}

export const hederaWalletConnect = new HederaWalletConnect();