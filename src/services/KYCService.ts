import { KycFormData, KycRecord } from "../types";

export class KYCService {
  /**
   * Mocks a KYC verification process.
   * In a real scenario, this would involve more complex validation or a call to a third-party KYC provider.
   * For now, we'll implement a simple validation.
   * @param kycData The KYC data submitted by the user.
   * @returns A mock KycRecord with a verification status.
   */
  async submitForVerification(userId: string, kycData: KycFormData): Promise<Partial<KycRecord>> {
    console.log(`Mock KYC: Submitting verification for user ${userId} with data:`, kycData);

    let verification_status: KycRecord["verification_status"] = "pending";

    // Simple mock validation rules:
    // 1. ID number must be at least 8 characters long (arbitrary rule for demo)
    // 2. Address must be at least 15 characters long (arbitrary rule for demo)
    if (kycData.idNumber.length >= 8 && kycData.address.length >= 15) {
      verification_status = "verified";
    } else {
      verification_status = "rejected";
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For a full KycRecord, you'd save it to the database and get an ID, hcs_record_id, etc.
    return {
      user_id: userId,
      id_type: kycData.idType,
      id_number: kycData.idNumber,
      // In a real app, file URLs would be stored after upload
      // selfie_url: "mock-selfie-url.jpg",
      // id_document_url: "mock-id-document-url.jpg",
      verification_status,
      created_at: new Date(),
    };
  }
}
