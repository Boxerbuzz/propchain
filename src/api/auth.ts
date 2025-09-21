import { supabase } from "../lib/supabase";
import { UserRepository } from "../data/repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { SignUpFormSchema, LoginFormSchema, ApiResponseSchema } from "../types";
import { z } from "zod";

// Initialize repositories and services
const userRepository = new UserRepository(supabase);
const authService = new AuthService(supabase, userRepository);

// Define response types
const AuthSuccessResponseSchema = ApiResponseSchema(z.object({ user: z.any(), session: z.any().nullable() }));
type AuthSuccessResponse = z.infer<typeof AuthSuccessResponseSchema>;

const AuthErrorResponseSchema = ApiResponseSchema(z.any());
type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;

export const authApi = {
  async register(formData: any): Promise<AuthSuccessResponse | AuthErrorResponse> {
    try {
      const validatedData = SignUpFormSchema.parse(formData);
      const { user, session } = await authService.register(validatedData);
      return { success: true, data: { user, session }, message: "Registration successful." };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message, message: "Validation Error" };
      }
      return { success: false, error: error.message, message: "Registration failed." };
    }
  },

  async login(formData: any): Promise<AuthSuccessResponse | AuthErrorResponse> {
    try {
      const validatedData = LoginFormSchema.parse(formData);
      const { user, session } = await authService.login(validatedData);
      return { success: true, data: { user, session }, message: "Login successful." };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message, message: "Validation Error" };
      }
      return { success: false, error: error.message, message: "Login failed." };
    }
  },

  async logout(): Promise<AuthSuccessResponse | AuthErrorResponse> {
    try {
      await authService.logout();
      return { success: true, message: "Logout successful." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Logout failed." };
    }
  },

  // Add other auth-related API functions here
  async getCurrentUser(): Promise<AuthSuccessResponse | AuthErrorResponse> {
    try {
      const user = await authService.getCurrentUser();
      return { success: true, data: { user, session: null }, message: "Current user retrieved." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve current user." };
    }
  }
};
