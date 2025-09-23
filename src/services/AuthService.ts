import { SupabaseClient } from "@supabase/supabase-js";
import { UserRepository } from "../data/repositories/UserRepository";
import { NotificationRepository } from "../data/repositories/NotificationRepository";
import { WalletRepository } from "../data/repositories/WalletRepository";
import { SignUpFormData, LoginFormData, User } from "../types";

export class AuthService {
  private supabase: SupabaseClient;
  private userRepository: UserRepository;
  private notificationRepository: NotificationRepository;
  private walletRepository: WalletRepository;

  constructor(
    supabase: SupabaseClient, 
    userRepository: UserRepository,
    notificationRepository: NotificationRepository,
    walletRepository: WalletRepository
  ) {
    this.supabase = supabase;
    this.userRepository = userRepository;
    this.notificationRepository = notificationRepository;
    this.walletRepository = walletRepository;
  }

  async register(formData: SignUpFormData): Promise<{ user: User | null; session: any | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user && data.session) {
      const newUser: Partial<User> = {
        id: data.user.id,
        email: data.user.email!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        emailVerifiedAt: data.user.email_confirmed_at ? new Date() : null,
      };

      try {
        // Create user profile
        const createdUser = await this.userRepository.create(newUser);

        if (!createdUser) {
          return { user: null, session: null, error: "Failed to create user profile in the database." };
        }

        // Create welcome notification
        await this.createWelcomeNotification(data.user.id);

        // Create Hedera wallet
        await this.createHederaWallet(data.user.id);

        const profile = await this.userRepository.findById(data.user.id);
        return { user: profile, session: data.session, error: null };

      } catch (walletError: any) {
        console.warn("Wallet creation failed during signup:", walletError.message);
        // Continue with signup even if wallet creation fails
        const profile = await this.userRepository.findById(data.user.id);
        return { user: profile, session: data.session, error: null };
      }
    }
    return { user: null, session: null, error: "Registration failed: no user or session data." };
  }

  private async createWelcomeNotification(userId: string): Promise<void> {
    try {
      await this.notificationRepository.create({
        userId: userId,
        title: "Welcome to PropChain!",
        message: "Your account has been created successfully. Start exploring investment opportunities and building your property portfolio.",
        notificationType: "system",
        priority: "normal",
        actionUrl: "/dashboard",
      });
    } catch (error: any) {
      console.error("Failed to create welcome notification:", error.message);
    }
  }

  private async createHederaWallet(userId: string): Promise<void> {
    try {
      // Call the create-hedera-account edge function
      const { data, error } = await this.supabase.functions.invoke('create-hedera-account', {
        body: {}
      });

      if (error) throw error;

      if (data?.accountId && data?.privateKey) {
        // Create wallet record in database
        const walletData = {
          userId: userId,
          walletType: 'custodial' as const,
          walletName: 'Primary Hedera Wallet',
          hederaAccountId: data.accountId,
          privateKeyEncrypted: data.privateKey, // Edge function should encrypt this
          isPrimary: true,
          securityLevel: 'standard' as const,
          balanceHbar: 0,
          balanceNgn: 0,
          balanceUsd: 0,
        };

        const wallet = await this.walletRepository.create(walletData);

        if (wallet) {
          // Update user with hedera account ID
          await this.userRepository.update(userId, {
            hederaAccountId: data.accountId,
            walletType: 'custodial'
          });

          console.log(`Created Hedera wallet ${data.accountId} for user ${userId}`);
        }
      }
    } catch (error: any) {
      console.error("Failed to create Hedera wallet:", error.message);
      throw error;
    }
  }

  async login(formData: LoginFormData): Promise<{ user: User | null; session: any | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user && data.session) {
      const userProfile = await this.userRepository.findById(data.user.id);
      return { user: userProfile, session: data.session, error: null };
    }
    return { user: null, session: null, error: "Login failed: no user or session data." };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    // Supabase handles email verification automatically via the magic link or OTP sent to the user.
    // This method might be used if you implement a custom email verification flow with Supabase.
    // For a standard Supabase setup, the magic link or OTP directly signs in the user.
    // This is a placeholder.
    console.log(`Mock: Verifying email with token: ${token}`);
    // In a real scenario, you'd likely be verifying a session after a user clicks a link.
    // For example, calling supabase.auth.verifyOtp after receiving an OTP.
    return true; 
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  }

  // This method would typically be used in your backend API layer to validate a token
  // sent from the mobile app or frontend.
  async validateSupabaseToken(jwt: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser(jwt);
    if (error) {
      console.error("Token validation error:", error.message);
      return null;
    }
    if (data.user) {
      const userProfile = await this.userRepository.findById(data.user.id);
      return userProfile;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error("Error fetching current user:", error.message);
      return null;
    }
    if (user) {
      const userProfile = await this.userRepository.findById(user.id);
      return userProfile;
    }
    return null;
  }
}
