import { SupabaseClient } from "@supabase/supabase-js";
import { UserRepository } from "../data/repositories/UserRepository";
import { SignUpFormData, LoginFormData, User } from "../types";

export class AuthService {
  private supabase: SupabaseClient;
  private userRepository: UserRepository;

  constructor(supabase: SupabaseClient, userRepository: UserRepository) {
    this.supabase = supabase;
    this.userRepository = userRepository;
  }

  async register(formData: SignUpFormData): Promise<{ user: User | null; session: any | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user && data.session) {
      // Optionally, you might want to save additional user profile data to your 'users' table
      // using the userRepository here, if it's not automatically handled by Supabase's auth trigger.
      const newUser: Partial<User> = {
        id: data.user.id,
        email: data.user.email!,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email_verified_at: data.user.email_confirmed_at ? new Date() : null,
        // Other fields will be default or set later
      };
      // Since Supabase auth.signUp creates an entry in auth.users, 
      // and often a trigger inserts into public.users, we might just fetch here
      // or assume the trigger handles it. For now, we'll return the auth user.

      const profile = await this.userRepository.findById(data.user.id);

      return { user: profile, session: data.session };
    }
    return { user: null, session: null };
  }

  async login(formData: LoginFormData): Promise<{ user: User | null; session: any | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user && data.session) {
      const userProfile = await this.userRepository.findById(data.user.id);
      return { user: userProfile, session: data.session };
    }
    return { user: null, session: null };
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
