import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, MapPin, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterProperty = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    propertyType: "",
    totalValue: "",
    tokenSupply: "",
    minInvestment: "",
    expectedReturn: ""
  });
  const navigate = useNavigate();

  const propertyTypes = [
    "Residential Apartment",
    "Commercial Office",
    "Retail Space",
    "Warehouse",
    "Mixed Use",
    "Land"
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle property registration
    navigate("/properties/upload-docs");
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              placeholder="e.g., Luxury Apartment Complex in Victoria Island"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the property..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <select
              id="propertyType"
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              className="w-full p-2 border border-input bg-background rounded-md"
            >
              <option value="">Select property type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="e.g., 123 Ahmadu Bello Way"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Lagos"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g., Lagos State"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tokenization Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="totalValue">Total Property Value (₦)</Label>
            <Input
              id="totalValue"
              type="number"
              placeholder="e.g., 500000000"
              value={formData.totalValue}
              onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="tokenSupply">Total Token Supply</Label>
            <Input
              id="tokenSupply"
              type="number"
              placeholder="e.g., 10000"
              value={formData.tokenSupply}
              onChange={(e) => setFormData({...formData, tokenSupply: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="minInvestment">Minimum Investment (₦)</Label>
            <Input
              id="minInvestment"
              type="number"
              placeholder="e.g., 50000"
              value={formData.minInvestment}
              onChange={(e) => setFormData({...formData, minInvestment: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
            <Input
              id="expectedReturn"
              type="number"
              placeholder="e.g., 12"
              value={formData.expectedReturn}
              onChange={(e) => setFormData({...formData, expectedReturn: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{formData.propertyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span>{formData.city}, {formData.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Value:</span>
                <span>₦{parseInt(formData.totalValue || "0").toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Token Supply:</span>
                <span>{parseInt(formData.tokenSupply || "0").toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Min Investment:</span>
                <span>₦{parseInt(formData.minInvestment || "0").toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Expected Return:</span>
                <span>{formData.expectedReturn}% annually</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-spartan">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Register Property</h1>
        <p className="text-muted-foreground">
          Submit your property for tokenization on PropChain
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, title: "Property Details", icon: FileText },
                { step: 2, title: "Location", icon: MapPin },
                { step: 3, title: "Tokenization", icon: DollarSign },
                { step: 4, title: "Review", icon: CheckCircle }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = step === item.step;
                const isCompleted = step > item.step;
                
                return (
                  <div key={item.step} className={`flex items-center gap-3 ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-success text-white' : 'bg-muted'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Step {step} of 4</CardTitle>
                <Badge variant="outline">Property Registration</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Submit for Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterProperty;