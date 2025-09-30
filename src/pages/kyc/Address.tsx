import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, ArrowLeft, Upload, CheckCircle, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { kycService } from "@/services/kycService";
import { kycDraftService } from "@/services/kycDraftService";
import { useToast } from "@/hooks/use-toast";

interface AddressData {
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
}

export default function Address() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
          setAddressData({
            documentType: draftData.form_data.documentType || "",
            firstName: draftData.form_data.firstName || "",
            lastName: draftData.form_data.lastName || "",
            email: draftData.form_data.email || "",
            phone: draftData.form_data.phone || "",
            dateOfBirth: draftData.form_data.dateOfBirth || "",
            address: draftData.form_data.address || {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "Nigeria"
            },
            documentNumber: draftData.form_data.documentNumber || "",
            documentImageUrl: draftData.document_image_url || "",
            selfieUrl: draftData.selfie_url || "",
          });
          
          // Set form data from draft
          setFormData({
            street: draftData.form_data.address?.street || "",
            city: draftData.form_data.address?.city || "",
            state: draftData.form_data.address?.state || "",
            postalCode: draftData.form_data.address?.postalCode || "",
            country: draftData.form_data.address?.country || "Nigeria",
          });
        } else {
          // Fallback to location state
          const stateData = location.state as AddressData;
          if (stateData) {
            setAddressData(stateData);
            setFormData({
              street: stateData.address.street || "",
              city: stateData.address.city || "",
              state: stateData.address.state || "",
              postalCode: stateData.address.postalCode || "",
              country: stateData.address.country || "Nigeria",
            });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file
      if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
        setUploadError("Please upload an image or PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }

      setProofFile(file);
    }
  };

  const uploadProofFile = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const fileUrls = await kycService.uploadKYCFiles(
      [
        { file, type: "id_front" }, // Reuse the same upload method
      ],
      user.id
    );

    return fileUrls.id_front;
  };

  const handleContinue = async () => {
    if (!addressData || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      let proofUrl = "";
      
      // Upload proof file if provided
      if (proofFile) {
        proofUrl = await uploadProofFile(proofFile);
      }

      // Update draft with address data and proof URL, complete step
      const success = await kycDraftService.completeStep(
        user.id,
        "address",
        "review",
        {
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          }
        },
        proofUrl ? { key: "proof_of_address_url", url: proofUrl } : undefined
      );

      if (!success) {
        throw new Error("Failed to save draft data");
      }

      // Navigate to review page
      navigate("/kyc/review");
    } catch (error: any) {
      setUploadError(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/kyc/selfie">
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
              <span className="text-sm text-muted-foreground">Step 4 of 5</span>
              <Progress value={80} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Verify Your Address
          </h1>
          <p className="text-muted-foreground">
            Please provide your current residential address for verification
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div>
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    placeholder="Enter your street address"
                    className="mt-1"
                    value={formData.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      className="mt-1"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="abia">Abia</SelectItem>
                        <SelectItem value="adamawa">Adamawa</SelectItem>
                        <SelectItem value="akwa-ibom">Akwa Ibom</SelectItem>
                        <SelectItem value="anambra">Anambra</SelectItem>
                        <SelectItem value="bauchi">Bauchi</SelectItem>
                        <SelectItem value="bayelsa">Bayelsa</SelectItem>
                        <SelectItem value="benue">Benue</SelectItem>
                        <SelectItem value="borno">Borno</SelectItem>
                        <SelectItem value="cross-river">Cross River</SelectItem>
                        <SelectItem value="delta">Delta</SelectItem>
                        <SelectItem value="ebonyi">Ebonyi</SelectItem>
                        <SelectItem value="edo">Edo</SelectItem>
                        <SelectItem value="ekiti">Ekiti</SelectItem>
                        <SelectItem value="enugu">Enugu</SelectItem>
                        <SelectItem value="fct">FCT Abuja</SelectItem>
                        <SelectItem value="gombe">Gombe</SelectItem>
                        <SelectItem value="imo">Imo</SelectItem>
                        <SelectItem value="jigawa">Jigawa</SelectItem>
                        <SelectItem value="kaduna">Kaduna</SelectItem>
                        <SelectItem value="kano">Kano</SelectItem>
                        <SelectItem value="katsina">Katsina</SelectItem>
                        <SelectItem value="kebbi">Kebbi</SelectItem>
                        <SelectItem value="kogi">Kogi</SelectItem>
                        <SelectItem value="kwara">Kwara</SelectItem>
                        <SelectItem value="lagos">Lagos</SelectItem>
                        <SelectItem value="nasarawa">Nasarawa</SelectItem>
                        <SelectItem value="niger">Niger</SelectItem>
                        <SelectItem value="ogun">Ogun</SelectItem>
                        <SelectItem value="ondo">Ondo</SelectItem>
                        <SelectItem value="osun">Osun</SelectItem>
                        <SelectItem value="oyo">Oyo</SelectItem>
                        <SelectItem value="plateau">Plateau</SelectItem>
                        <SelectItem value="rivers">Rivers</SelectItem>
                        <SelectItem value="sokoto">Sokoto</SelectItem>
                        <SelectItem value="taraba">Taraba</SelectItem>
                        <SelectItem value="yobe">Yobe</SelectItem>
                        <SelectItem value="zamfara">Zamfara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code"
                      className="mt-1"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="nigeria">Nigeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Address Proof */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Address Proof Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a document that shows your current address (not older
                than 3 months):
              </p>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {proofFile ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {proofFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProofFile(null);
                        setUploadError(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium mb-2">Upload Address Proof</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Utility bill, bank statement, or government correspondence
                    </p>
                    <input
                    title="Proof Address"
                      type="file"
                      id="proof-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={() => {
                        console.log("🔘 Choose File button clicked");
                        document.getElementById("proof-upload")?.click();
                      }}
                    >
                      Choose File
                    </Button>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              size="lg"
              className="px-8"
              onClick={handleContinue}
              disabled={
                isUploading ||
                !formData.street ||
                !formData.city ||
                !formData.state
              }
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Continue to Review"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
