import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Camera, MapPin, Edit, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Review() {
  const reviewData = [
    {
      title: "Government ID",
      icon: FileText,
      status: "Uploaded",
      description: "National ID (NIN) - front side",
      editLink: "/kyc/upload-id"
    },
    {
      title: "Selfie Photo",
      icon: Camera,
      status: "Captured",
      description: "Identity verification selfie",
      editLink: "/kyc/selfie"
    },
    {
      title: "Address Verification", 
      icon: MapPin,
      status: "Completed",
      description: "123 Example Street, Lagos, Nigeria",
      editLink: "/kyc/address"
    }
  ];

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
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="text-xl font-bold text-foreground">PropChain</span>
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
            {reviewData.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Link to={item.editLink}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    <span className="text-xs text-primary-foreground font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Automatic Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI system will verify your documents (usually takes 2-5 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Manual Review (if needed)</p>
                    <p className="text-sm text-muted-foreground">
                      If automatic verification is inconclusive, our team will review manually (1-3 business days)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-muted-foreground font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Account Activation</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, you'll receive an email and can access all features
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement */}
          <Card className="border-border mb-8">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  By submitting your KYC information, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>.
                </p>
                <p>
                  Your personal information is encrypted and stored securely in compliance 
                  with Nigerian data protection regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Link to="/kyc/status">
              <Button size="lg" className="px-8">
                Submit for Verification
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}