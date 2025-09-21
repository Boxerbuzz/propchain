import { supabase } from "../lib/supabase";
import { UserRepository } from "../data/repositories/UserRepository";
import { WalletRepository } from "../data/repositories/WalletRepository";
import { NotificationRepository } from "../data/repositories/NotificationRepository";
import { KYCService } from "../services/KYCService";
import { UserService } from "../services/UserService";
import { User, KycFormData, KycFormSchema, ApiResponseSchema, type Notification, Wallet, PaginatedResponseSchema, UserSchema, NotificationSchema, WalletSchema, GenericApiResponse, BooleanApiResponse } from "../types";
import { z } from "zod";

// Initialize repositories and services
const userRepository = new UserRepository(supabase);
const walletRepository = new WalletRepository(supabase);
const notificationRepository = new NotificationRepository(supabase);
const kycService = new KYCService();
const userService = new UserService(userRepository, walletRepository, notificationRepository, kycService);

// Define response types
const UserResponseSchema = ApiResponseSchema(UserSchema);
type UserResponse = z.infer<typeof UserResponseSchema>;

const NotificationsResponseSchema = ApiResponseSchema(z.array(NotificationSchema));
type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;

const WalletsResponseSchema = ApiResponseSchema(z.array(WalletSchema));
type WalletsResponse = z.infer<typeof WalletsResponseSchema>;

const KycStatusResponseSchema = ApiResponseSchema(z.enum(["pending", "verified", "rejected", "expired"]));
type KycStatusResponse = z.infer<typeof KycStatusResponseSchema>;

export const userApi = {
  async getUserProfile(userId: string): Promise<UserResponse | GenericApiResponse> {
    try {
      const user = await userService.getUserProfile(userId);
      if (!user) {
        return { success: false, message: "User not found." };
      }
      return { success: true, data: user, message: "User profile retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve user profile." };
    }
  },

  async updateProfile(userId: string, formData: any): Promise<UserResponse | GenericApiResponse> {
    try {
      // For a real update, you'd have a UserUpdateFormSchema
      const updatedUser = await userService.updateProfile(userId, formData);
      if (!updatedUser) {
        return { success: false, message: "User not found or update failed." };
      }
      return { success: true, data: updatedUser, message: "User profile updated successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to update user profile." };
    }
  },

  async submitKyc(userId: string, formData: any): Promise<KycStatusResponse | GenericApiResponse> {
    try {
      const validatedData = KycFormSchema.parse(formData);
      const kycStatus = await userService.submitKYC(userId, validatedData);
      return { success: true, data: kycStatus, message: "KYC submitted successfully." };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message, message: "Validation Error" };
      }
      return { success: false, error: error.message, message: "KYC submission failed." };
    }
  },

  async getUserNotifications(userId: string): Promise<NotificationsResponse | GenericApiResponse> {
    try {
      const notifications = await userService.getUserNotifications(userId);
      return { success: true, data: notifications, message: "Notifications retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve notifications." };
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<BooleanApiResponse> {
    try {
      const success = await userService.markAllNotificationsAsRead(userId);
      return { success, message: success ? "All notifications marked as read." : "Failed to mark all notifications as read." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to mark all notifications as read." };
    }
  },

  async clearReadNotifications(userId: string): Promise<BooleanApiResponse> {
    try {
      const success = await userService.clearReadNotifications(userId);
      return { success, message: success ? "Read notifications cleared." : "Failed to clear read notifications." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to clear read notifications." };
    }
  },

  async getUserWallets(userId: string): Promise<WalletsResponse | GenericApiResponse> {
    try {
      const wallets = await userService.getUserWallets(userId);
      return { success: true, data: wallets, message: "User wallets retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve user wallets." };
    }
  },
};
