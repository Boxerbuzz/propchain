import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Camera, MapPin, Edit, ArrowLeft, Clock } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { kycService } from "@/services/kycService";
import { kycDraftService } from "@/services/kycDraftService";
import { useToast } from "@/hooks/use-toast";

interface ReviewData {
  documentType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documentNumber: string;
  documentImageUrl: string;
  selfieUrl: string;
  proofOfAddressUrl?: string;
}

export default function Review() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  // Load data from draft or previous steps
  useEffect(() => {
    const loadDraftData = async () => {
      if (!user?.id) return;

      try {
        // Try to get existing draft
        const draftData = await kycDraftService.getDraft(user.id);

        if (draftData) {
          setDraft(draftData);
          setReviewData({
            documentType: draftData.form_data.documentType || "",
            firstName: draftData.form_data.firstName || "",
            lastName: draftData.form_data.lastName || "",
            email: draftData.form_data.email || "",
            phone: draftData.form_data.phone || "",
            dateOfBirth: draftData.form_data.dateOfBirth,
            address: draftData.form_data.address || {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "Nigeria",
            },
            documentNumber: draftData.form_data.documentNumber || "",
            documentImageUrl: draftData.document_image_url || "",
            selfieUrl: draftData.selfie_url || "",
            proofOfAddressUrl: draftData.proof_of_address_url || "",
          });
        } else {
          // Fallback to location state
          const stateData = location.state as ReviewData;
          if (stateData) {
            setReviewData(stateData);
          } else {
            navigate("/kyc/start");
          }
        }
      } catch (error) {
        console.error("Error loading draft data:", error);
        navigate("/kyc/start");
      }
    };

    loadDraftData();
  }, [user?.id, location.state, navigate]);

  const handleSubmit = async () => {
    if (!reviewData || !user || !agreedToTerms) return;

    setIsSubmitting(true);

    try {
      // Add missing user data from AuthContext
      const submissionData = {
        userId: user.id,
        firstName: user.first_name || "", // From AuthContext
        lastName: user.last_name || "", // From AuthContext
        email: user.email || "", // From AuthContext
        phone: user.phone || "", // From AuthContext
        nationality: user.nationality || "Nigeria", // From AuthContext

        // KYC-specific data (from KYC flow)
        dateOfBirth: reviewData.dateOfBirth,
        address: reviewData.address,
        documentType: reviewData.documentType as
          | "national_id"
          | "passport"
          | "drivers_license",
        documentNumber: reviewData.documentNumber,
        documentImages: [reviewData.documentImageUrl],
        selfieImage: reviewData.selfieUrl,
        proofOfAddressUrl: reviewData.proofOfAddressUrl || "",
      };

      // Submit KYC verification (this creates the record and triggers webhook)
      const result = await kycService.submitKYCVerification(submissionData);

      if (result.success) {
        // Delete the draft after successful submission
        await kycDraftService.deleteDraft(user.id);

        toast({
          title: "KYC Submitted Successfully! 🎉",
          description:
            "Your KYC verification has been submitted. You'll receive an email notification once processed.",
        });

        // Navigate to status page
        navigate("/kyc/status", {
          state: {
            kycId: result.verificationId,
            status: "pending",
          },
        });
      } else {
        toast({
          title: "Submission Failed",
          description:
            result.error ||
            "Failed to submit KYC verification. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description:
          error.message ||
          "An error occurred during submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/kyc/address">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    PC
                  </span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  PropChain
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Step 5 of 5</span>
              <Progress value={100} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Review Your Information
          </h1>
          <p className="text-muted-foreground">
            Please review all your submitted information before final submission
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Review Items */}
          <div className="space-y-6 mb-8">
            {reviewData && (
              <>
                {/* Government ID */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              Government ID
                            </h3>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Uploaded
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reviewData.documentType
                              .replace("_", " ")
                              .toUpperCase()}{" "}
                            - {reviewData.documentNumber}
                          </p>
                        </div>
                      </div>
                      <Link to="/kyc/upload-id" state={reviewData}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Selfie Photo */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              Selfie Photo
                            </h3>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Captured
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Identity verification selfie
                          </p>
                        </div>
                      </div>
                      <Link to="/kyc/selfie" state={reviewData}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Verification */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              Address Verification
                            </h3>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reviewData.address.street},{" "}
                            {reviewData.address.city},{" "}
                            {reviewData.address.state}
                          </p>
                        </div>
                      </div>
                      <Link to="/kyc/address" state={reviewData}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Processing Information */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Automatic Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI system will verify your documents (usually takes
                      2-5 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Manual Review (if needed)</p>
                    <p className="text-sm text-muted-foreground">
                      If automatic verification is inconclusive, our team will
                      review manually (1-3 business days)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Account Activation</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, you'll receive an email and can access all
                      features
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement */}
          <Card className="border-border mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-agreement"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terms-agreement"
                    className="text-sm text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Privacy Policy
                    </Link>
                    . I understand that my personal information will be
                    encrypted and stored securely in compliance with Nigerian
                    data protection regulations.
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              size="lg"
              className="px-8"
              onClick={handleSubmit}
              disabled={isSubmitting || !agreedToTerms || !reviewData}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
