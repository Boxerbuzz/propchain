import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, FileText, BookOpen, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DocumentType() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("");

  const documentTypes = [
    {
      id: "nin",
      title: "National ID (NIN)",
      description: "Nigerian National Identification Number card",
      icon: CreditCard,
      recommended: true
    },
    {
      id: "drivers-license",
      title: "Driver's License",
      description: "Valid Nigerian driver's license",
      icon: FileText,
      recommended: false
    },
    {
      id: "passport",
      title: "International Passport",
      description: "Nigerian or international passport",
      icon: BookOpen,
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/kyc/start">
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
              <span className="text-sm text-muted-foreground">Step 1 of 5</span>
              <Progress value={20} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Select Your ID Type
          </h1>
          <p className="text-muted-foreground">
            Choose the government-issued ID you'd like to use for verification
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardHeader className="text-center">
                  {type.recommended && (
                    <div className="mb-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Requirements */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Document Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Document must be valid and not expired</li>
              <li>• Photo must be clear and readable</li>
              <li>• All four corners of the document must be visible</li>
              <li>• No glare or shadows on the document</li>
              <li>• Document must be issued by the Nigerian government</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8" 
            disabled={!selectedType}
            onClick={() => {
              if (selectedType) {
                navigate('/kyc/upload-id', { 
                  state: { 
                    documentType: selectedType,
                    // Add other form data here as we build the flow
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    address: {
                      street: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'Nigeria'
                    },
                    documentNumber: ''
                  } 
                });
              }
            }}
          >
            Continue with {selectedType ? documentTypes.find(t => t.id === selectedType)?.title : 'Selected ID'}
          </Button>
        </div>
      </div>
    </div>
  );
}