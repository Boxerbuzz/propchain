import { UserRepository } from "../data/repositories/UserRepository";
import { WalletRepository } from "../data/repositories/WalletRepository";
import { NotificationRepository } from "../data/repositories/NotificationRepository";
import { KYCService } from "./KYCService";
import { User, KycFormData, Notification, Wallet, KycRecord } from "../types";

export class UserService {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private notificationRepository: NotificationRepository;
  private kycService: KYCService;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    notificationRepository: NotificationRepository,
    kycService: KYCService
  ) {
    this.userRepository = userRepository;
    this.walletRepository = walletRepository;
    this.notificationRepository = notificationRepository;
    this.kycService = kycService;
  }

  async getUserProfile(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async updateProfile(
    userId: string,
    data: Partial<User>
  ): Promise<User | null> {
    return this.userRepository.update(userId, data);
  }

  async submitKYC(
    userId: string,
    kycData: KycFormData
  ): Promise<KycRecord["verificationStatus"]> {
    const mockKycRecord = await this.kycService.submitForVerification(
      userId,
      kycData
    );

    // Update user's KYC status and level based on the mock verification result
    let kycStatus: User["kycStatus"] = "pending";
    let kycLevel: User["kycLevel"] = "tier_1"; // Default

    if (mockKycRecord.verificationStatus === "verified") {
      kycStatus = "verified";
      // Logic to determine kycLevel based on submitted data or mock logic
      if (kycData.idType === "passport") {
        kycLevel = "tier_3";
      } else if (
        kycData.idType === "nin" ||
        kycData.idType === "drivers_license"
      ) {
        kycLevel = "tier_2";
      }
    } else if (mockKycRecord.verificationStatus === "rejected") {
      kycStatus = "rejected";
    }

    await this.userRepository.update(userId, {
      kycStatus: kycStatus,
      kycLevel: kycLevel,
    });

    return kycStatus;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.getUnreadNotificationsByUserId(userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    return this.notificationRepository.markAllAsReadByUserId(userId);
  }

  async clearReadNotifications(userId: string): Promise<boolean> {
    return this.notificationRepository.deleteReadNotificationsByUserId(userId);
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return this.walletRepository.findByUserId(userId);
  }

  // Add methods for portfolio retrieval, etc.
}
