import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authApi } from "../api/auth";
import { User, SignUpFormData, LoginFormData } from "../types";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (formData: LoginFormData) => Promise<string | null>;
  signup: (formData: SignUpFormData) => Promise<string | null>;
  logout: () => Promise<string | null>;
  // Add a method for password reset as well
  resetPassword: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data?.user) {
        setCurrentUser(response.data.user as User);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Listen for auth state changes from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event);
      if (session?.user) {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data?.user) {
          setCurrentUser(response.data.user as User);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchCurrentUser]);

  const login = async (formData: LoginFormData): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      if (response.success && response.data?.user) {
        setCurrentUser(response.data.user as User);
        return null; // No error
      } else {
        return response.message || "Login failed.";
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return error.message || "An unexpected error occurred during login.";
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: SignUpFormData): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(formData);
      if (response.success && response.data?.user) {
        setCurrentUser(response.data.user as User);
        return null; // No error
      } else {
        return response.message || "Signup failed.";
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      return error.message || "An unexpected error occurred during signup.";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await authApi.logout();
      if (response.success) {
        setCurrentUser(null);
        return null; // No error
      } else {
        return response.message || "Logout failed.";
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      return error.message || "An unexpected error occurred during logout.";
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Assuming authApi.resetPassword exists and handles the Supabase call
      // This is a simplified direct call to the service for now.
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return error.message;
      }
      return null; // No error, email sent
    } catch (error: any) {
      console.error("Reset password error:", error);
      return error.message || "An unexpected error occurred during password reset.";
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
