import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Camera,
  FileImage,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { kycService } from "@/services/kycService";
import { kycDraftService } from "@/services/kycDraftService";
import { useToast } from "@/hooks/use-toast";

interface KYCFormData {
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
}

export default function UploadID() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [kycData, setKycData] = useState<KYCFormData | null>(null);
  const [draft, setDraft] = useState<any>(null);

  // Load KYC data from draft or previous steps
  useEffect(() => {
    const loadDraftData = async () => {
      if (!user?.id) return;

      try {
        // Try to get existing draft
        const draftData = await kycDraftService.getOrCreateDraft(user.id);
        
        if (draftData) {
          setDraft(draftData);
          setKycData({
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
          });
        } else {
          // Fallback to location state
          const stateData = location.state as KYCFormData;
          if (stateData) {
            setKycData(stateData);
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

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file (JPG, PNG, etc.)";
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    console.log("🎯 File dropped:", e.dataTransfer.files);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log("📄 Dropped file:", file.name, file.size, file.type);
      const error = validateFile(file);
      if (error) {
        console.log("❌ Drop validation error:", error);
        setUploadError(error);
      } else {
        console.log("✅ Drop validated successfully");
        setUploadedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 File input changed:", e.target.files);
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("📄 Selected file:", file.name, file.size, file.type);
      const error = validateFile(file);
      if (error) {
        console.log("❌ File validation error:", error);
        setUploadError(error);
      } else {
        console.log("✅ File validated successfully");
        setUploadedFile(file);
      }
    } else {
      console.log("❌ No file selected");
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    // Use the new uploadKYCFiles method for better organization
    const fileUrls = await kycService.uploadKYCFiles(
      [{ file, type: "id_front" }],
      user.id
    );

    return fileUrls.id_front;
  };

  const handleContinue = async () => {
    if (!uploadedFile || !kycData || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload the file
      const fileUrl = await uploadFile(uploadedFile);

      // Update draft with document image URL and complete step
      const success = await kycDraftService.completeStep(
        user.id,
        "upload_id",
        "selfie",
        undefined,
        { key: "document_image_url", url: fileUrl }
      );

      if (!success) {
        throw new Error("Failed to save draft data");
      }

      toast({
        title: "ID Uploaded Successfully!",
        description:
          "Your ID document has been uploaded. Please continue with the selfie verification.",
      });

      // Navigate to selfie page
      navigate("/kyc/selfie");
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
              <Link to="/kyc/document-type">
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
              <span className="text-sm text-muted-foreground">Step 2 of 5</span>
              <Progress value={40} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Upload Your ID Document
          </h1>
          <p className="text-muted-foreground">
            Please upload a clear photo of your{" "}
            {kycData?.documentType === "nin"
              ? "National ID (NIN)"
              : kycData?.documentType === "drivers-license"
              ? "Driver's License"
              : kycData?.documentType === "passport"
              ? "International Passport"
              : "ID Document"}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <Card className="border-border mb-8">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadError(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>

                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drag and drop your ID here
                      </p>
                      <p className="text-muted-foreground">
                        or choose from your device
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <input
                        title="File Upload"
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          console.log("🔘 Choose File button clicked");
                          document.getElementById("file-upload")?.click();
                        }}
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>

                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {uploadError && (
            <Card className="border-red-200 bg-red-50 mb-8">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{uploadError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guidelines */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Photo Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    ✅ Good Photo
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• All four corners visible</li>
                    <li>• Text is clear and readable</li>
                    <li>• Good lighting, no shadows</li>
                    <li>• Document is flat and straight</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">❌ Avoid</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Blurry or unclear images</li>
                    <li>• Glare or reflections</li>
                    <li>• Cropped or cut-off edges</li>
                    <li>• Screenshots or photocopies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              size="lg"
              className="px-8"
              disabled={!uploadedFile || isUploading}
              onClick={handleContinue}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Continue to Selfie"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
