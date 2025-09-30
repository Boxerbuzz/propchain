import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, RefreshCw, ArrowLeft, Upload, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { kycService } from "@/services/kycService";
import { kycDraftService } from "@/services/kycDraftService";
import { toast } from "@/components/ui/use-toast";

interface SelfieData {
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
  kycId?: string;
}

export default function Selfie() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [photoTaken, setPhotoTaken] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selfieData, setSelfieData] = useState<SelfieData | null>(null);
  const [draft, setDraft] = useState<any>(null);

  // Load data from draft or previous step
  useEffect(() => {
    const loadDraftData = async () => {
      if (!user?.id) return;

      try {
        // Try to get existing draft
        const draftData = await kycDraftService.getDraft(user.id);
        
        if (draftData) {
          setDraft(draftData);
          setSelfieData({
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
          });
        } else {
          // Fallback to location state
          const stateData = location.state as SelfieData;
          if (stateData) {
            setSelfieData(stateData);
          } else {
            navigate('/kyc/start');
          }
        }
      } catch (error) {
        console.error("Error loading draft data:", error);
        navigate('/kyc/start');
      }
    };

    loadDraftData();
  }, [user?.id, location.state, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      setSelfieFile(file);
      setPhotoTaken(true);
    }
  };

  const uploadSelfie = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const fileUrls = await kycService.uploadKYCFiles([
      { file, type: 'selfie' }
    ], user.id);
    
    return fileUrls.selfie;
  };

  const handleContinue = async () => {
    if (!selfieFile || !selfieData || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload selfie file
      const selfieUrl = await uploadSelfie(selfieFile);
      
      // Update draft with selfie URL and complete step
      const success = await kycDraftService.completeStep(
        user.id,
        "selfie",
        "address",
        undefined,
        { key: "selfie_url", url: selfieUrl }
      );

      if (!success) {
        throw new Error("Failed to save draft data");
      }

      toast({
        title: "Selfie Uploaded Successfully!",
        description: "Your selfie has been uploaded. Please continue with address verification.",
      });

      // Navigate to address page
      navigate("/kyc/address");
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
              <Link to="/kyc/upload-id">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="text-xl font-bold text-foreground">PropChain</span>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Step 3 of 5</span>
              <Progress value={60} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Take a Selfie
          </h1>
          <p className="text-muted-foreground">
            We need to verify that you're the person on the ID document
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Camera Area */}
          <Card className="border-border mb-8">
            <CardContent className="p-8">
              <div className="relative">
                {/* Camera Preview/Placeholder */}
                <div className="aspect-[3/3] bg-muted rounded-lg relative overflow-hidden mb-6">
                  {photoTaken ? (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-primary font-medium">Photo Captured</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Face outline guide */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-64 border-2 border-primary border-dashed rounded-full opacity-50"></div>
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="text-center space-y-4">
                  {photoTaken ? (
                    <div className="flex justify-center space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setPhotoTaken(false);
                          setSelfieFile(null);
                          setUploadError(null);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retake
                      </Button>
                      <Button 
                        onClick={handleContinue}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          'Use This Photo'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        size="lg" 
                        onClick={() => setPhotoTaken(true)}
                        className="px-8"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Take Photo
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">or</div>
                      
                      <div>
                        <input
                        title="Selfie"
                          type="file"
                          id="selfie-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => {
                            console.log("🔘 Upload Photo button clicked");
                            document.getElementById("selfie-upload")?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Instructions */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Selfie Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">1</span>
                  </div>
                  <p>Position your face within the oval outline</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">2</span>
                  </div>
                  <p>Look directly at the camera with a neutral expression</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">3</span>
                  </div>
                  <p>Ensure good lighting on your face</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">4</span>
                  </div>
                  <p>Remove glasses, hats, or anything covering your face</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Privacy & Security</h3>
            <p className="text-sm text-muted-foreground">
              Your selfie is used only for identity verification and is encrypted and stored securely. 
              We use advanced AI to compare your selfie with your ID document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}