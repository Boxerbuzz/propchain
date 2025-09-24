import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authApi } from "../api/auth";
import { User, SignUpFormData, LoginFormData } from "../types";
import { supabase } from "../lib/supabase";

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

  const fetchCurrentUser = useCallback(async () => {
    console.log("AuthContext: fetchCurrentUser called");
    setIsInitializing(true);
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data?.user) {
        setCurrentUser(response.data.user as User);
        console.log("AuthContext: User fetched successfully");
      } else {
        setCurrentUser(null);
        console.log("AuthContext: No user found");
      }
    } catch (error) {
      console.error("fetchCurrentUser: Failed to fetch current user:", error);
      setCurrentUser(null);
    } finally {
      setIsInitializing(false);
      console.log("AuthContext: Initialization complete");
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed", event);
      try {
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
      } catch (error) {
        console.error("onAuthStateChange: Error in listener:", error);
        setCurrentUser(null);
      }
      // Removed the problematic setIsLoading(false) from here
    });

    return () => {
      authListener?.subscription?.unsubscribe();
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
        console.error("login: AuthContext - Login API Error:", response.error);
        return response.error || response.message || "Login failed with an unknown error.";
      }
    } catch (error: any) {
      console.error("login: Login error in AuthContext:", error);
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
        console.error("signup: AuthContext - Signup API Error:", response.error);
        return response.error || response.message || "Signup failed with an unknown error.";
      }
    } catch (error: any) {
      console.error("signup: Signup error in AuthContext:", error);
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
        console.error("logout: AuthContext - Logout API Error:", response.error);
        return response.error || response.message || "Logout failed with an unknown error.";
      }
    } catch (error: any) {
      console.error("logout: Logout error in AuthContext:", error);
      return error.message || "An unexpected error occurred during logout.";
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.error("resetPassword: AuthContext - Reset Password Supabase Error:", error);
        return error.message || "Failed to send password reset email.";
      }
      return null; // No error, email sent
    } catch (error: any) {
      console.error("resetPassword: Reset password error in AuthContext:", error);
      return error.message || "An unexpected error occurred during password reset.";
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
