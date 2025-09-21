import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Selfie() {
  const [photoTaken, setPhotoTaken] = useState(false);

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
                <div className="aspect-[3/4] bg-muted rounded-lg relative overflow-hidden mb-6">
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
                      <Button variant="outline" onClick={() => setPhotoTaken(false)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retake
                      </Button>
                      <Link to="/kyc/address">
                        <Button>
                          Use This Photo
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={() => setPhotoTaken(true)}
                      className="px-8"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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