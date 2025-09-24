import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, LoginFormData, SignUpFormData } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (formData: LoginFormData) => Promise<string | null>;
  signup: (formData: SignUpFormData) => Promise<string | null>;
  logout: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch user data from the users table
  const fetchUserFromDatabase = async (authUserId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user from database:', error);
        return null;
      }

      // Transform the data to match User type expectations
      const userData: User = {
        ...data,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        email_verified_at: data.email_verified_at ? new Date(data.email_verified_at) : null,
        phone_verified_at: data.phone_verified_at ? new Date(data.phone_verified_at) : null,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        investment_experience: data.investment_experience || 'beginner',
      } as User;

      return userData;
    } catch (error) {
      console.error('Error in fetchUserFromDatabase:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await fetchUserFromDatabase(session.user.id);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await fetchUserFromDatabase(session.user.id);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (formData: SignUpFormData): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        return authError.message;
      }

      if (!authData.user) {
        return 'Failed to create account';
      }

      // Create user record in the users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        console.error('Error creating user record:', userError);
        return 'Failed to create user profile';
      }

      // Send welcome notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: authData.user.id,
            title: 'Welcome to PropChain!',
            message: 'Thank you for joining our platform. Start exploring investment opportunities today.',
            notification_type: 'welcome',
            created_at: new Date().toISOString()
          });
      } catch (notificationError) {
        // Don't fail signup if notification fails
        console.error('Error creating welcome notification:', notificationError);
      }

      // Fetch and set the user data
      const userData = await fetchUserFromDatabase(authData.user.id);
      setCurrentUser(userData);

      return null; // Success
    } catch (error) {
      console.error('Signup error:', error);
      return 'An unexpected error occurred during signup';
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (formData: LoginFormData): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        return authError.message;
      }

      if (!authData.user) {
        return 'Login failed';
      }

      // Fetch user data from the users table
      const userData = await fetchUserFromDatabase(authData.user.id);
      if (!userData) {
        return 'User profile not found';
      }

      setCurrentUser(userData);
      return null; // Success
    } catch (error) {
      console.error('Login error:', error);
      return 'An unexpected error occurred during login';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return error.message;
      }
      
      setCurrentUser(null);
      return null; // Success
    } catch (error) {
      console.error('Logout error:', error);
      return 'An unexpected error occurred during logout';
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return error.message;
      }

      return null; // Success
    } catch (error) {
      console.error('Reset password error:', error);
      return 'An unexpected error occurred during password reset';
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    isInitializing,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
