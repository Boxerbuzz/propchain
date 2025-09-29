import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { toast } from "react-hot-toast";

// Module-level state for singleton behavior
let globalSession: Session | null = null;
let globalUser: User | null = null;
let globalLoading = true;
let subscribers: Array<() => void> = [];
let subscriptionInitialized = false;

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback());
};

const initializeSubscription = () => {
  if (subscriptionInitialized) return;
  subscriptionInitialized = true;

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    globalSession = session;

    if (session?.user) {
      // Defer profile fetch to avoid deadlocks
      setTimeout(() => {
        fetchUserProfile(session.user.id);
      }, 0);
    } else {
      globalUser = null;
    }

    globalLoading = false;
    notifySubscribers();
  });

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    globalSession = session;
    if (session?.user) {
      setTimeout(() => {
        fetchUserProfile(session.user.id);
      }, 0);
    } else {
      globalLoading = false;
      notifySubscribers();
    }
  });
};

const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      globalUser = null;
    } else {
      console.log("Fetched user profile:", data);

      globalUser = data as unknown as User;

      return data as unknown as User;
    }
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    globalUser = null;
  } finally {
    globalLoading = false;
    notifySubscribers();
  }
};

export const useAuth = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    initializeSubscription();

    const subscriber = () => forceUpdate({});
    subscribers.push(subscriber);

    return () => {
      subscribers = subscribers.filter((s) => s !== subscriber);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      globalLoading = true;
      notifySubscribers();

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        globalLoading = false;
        notifySubscribers();
        return error.message;
      }

      await fetchUserProfile(data.user.id);

      return null;
    } catch (error: any) {
      globalLoading = false;
      notifySubscribers();
      return error.message || "Login failed";
    }
  }, []);

  const signup = useCallback(
    async (formData: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      try {
        console.log("🚀 Starting signup process for:", formData.email);
        globalLoading = true;
        notifySubscribers();

        const redirectUrl = `${window.location.origin}/`;

        console.log("📧 Creating Supabase auth user...");
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          console.error("❌ Supabase auth signup error:", error);
          globalLoading = false;
          notifySubscribers();
          return error.message;
        }

        console.log("✅ Supabase auth user created:", data.user?.id);

        if (data.user) {
          console.log("👤 Creating user profile in database...");
          // Insert user profile
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
          });

          if (profileError) {
            console.error("❌ Error creating user profile:", profileError);
            globalLoading = false;
          } else {
            console.log("✅ User profile created successfully");
          }
        }

        console.log("🎉 Signup process completed successfully");
        return null;
      } catch (error: any) {
        console.error("💥 Signup process failed:", error);
        globalLoading = false;
        notifySubscribers();
        return error.message || "Signup failed";
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error logging out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return error.message;
      }

      return null;
    } catch (error: any) {
      return error.message || "Password reset failed";
    }
  }, []);

  return {
    session: globalSession,
    user: globalUser,
    isAuthenticated: !!globalSession,
    loading: globalLoading,
    login,
    signup,
    logout,
    resetPassword,
  };
};
