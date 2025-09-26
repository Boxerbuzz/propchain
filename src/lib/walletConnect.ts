import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

export interface HederaWalletInfo {
  name: string;
  icon: string;
  appUrl?: string;
  universalLink?: string;
  deepLink?: string;
}

// Hedera-compatible wallets
export const HEDERA_WALLETS: Record<string, HederaWalletInfo> = {
  hashpack: {
    name: "HashPack",
    icon: "🔥",
    appUrl: "https://www.hashpack.app/",
    universalLink: "https://wallet.hashpack.app/dapp",
    deepLink: "hashpack://dapp"
  },
  blade: {
    name: "Blade Wallet",
    icon: "⚡",
    appUrl: "https://bladewallet.io/",
    universalLink: "https://bladewallet.io/dapp",
    deepLink: "blade://dapp"
  },
  wallawallet: {
    name: "Walla Wallet",
    icon: "🦘",
    appUrl: "https://wallawallet.com/",
    universalLink: "https://wallawallet.com/dapp",
    deepLink: "walla://dapp"
  },
  yamgo: {
    name: "Yamgo",
    icon: "🌱",
    appUrl: "https://yamgo.com/",
    universalLink: "https://yamgo.com/dapp",
    deepLink: "yamgo://dapp"
  }
};

export class HederaWalletConnect {
  private connector: WalletConnect | null = null;
  private currentWallet: string | null = null;

  constructor() {
    this.setupConnector();
  }

  private setupConnector() {
    // Create connector
    this.connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    // Check if connection is already established
    if (this.connector.connected) {
      // Connection already established
      console.log("WalletConnect already connected");
    }

    // Subscribe to connection events
    this.connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log("WalletConnect connected:", { accounts, chainId });
    });

    this.connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log("WalletConnect session updated:", { accounts, chainId });
    });

    this.connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("WalletConnect disconnected");
      this.currentWallet = null;
    });
  }

  async connectWallet(walletType: string): Promise<{ success: boolean; account?: string; error?: string }> {
    try {
      this.currentWallet = walletType;
      
      if (!this.connector) {
        throw new Error("WalletConnect not initialized");
      }

      // Check if already connected
      if (this.connector.connected) {
        await this.connector.killSession();
      }

      // Create new session
      await this.connector.createSession();
      
      return new Promise((resolve) => {
        if (!this.connector) {
          resolve({ success: false, error: "WalletConnect not initialized" });
          return;
        }

        this.connector.on("connect", (error, payload) => {
          if (error) {
            resolve({ success: false, error: error.message });
            return;
          }

          const { accounts } = payload.params[0];
          resolve({ 
            success: true, 
            account: accounts[0] 
          });
        });

        // Timeout after 60 seconds
        setTimeout(() => {
          resolve({ success: false, error: "Connection timeout" });
        }, 60000);
      });

    } catch (error) {
      console.error("Wallet connection error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.connector && this.connector.connected) {
      await this.connector.killSession();
    }
    this.currentWallet = null;
  }

  getConnectedAccount(): string | null {
    if (this.connector && this.connector.connected) {
      return this.connector.accounts[0] || null;
    }
    return null;
  }

  getConnectedWallet(): string | null {
    return this.currentWallet;
  }

  isConnected(): boolean {
    return this.connector ? this.connector.connected : false;
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.connector || !this.connector.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this.connector.sendTransaction(transaction);
      return result;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connector || !this.connector.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this.connector.signMessage([
        this.connector.accounts[0],
        message
      ]);
      return result;
    } catch (error) {
      console.error("Signing error:", error);
      throw error;
    }
  }
}

// Singleton instance
export const hederaWalletConnect = new HederaWalletConnect();