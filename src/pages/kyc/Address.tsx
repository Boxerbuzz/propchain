import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Address() {
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
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="text-xl font-bold text-foreground">PropChain</span>
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
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="Enter your city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="nigeria">
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
                Upload a document that shows your current address (not older than 3 months):
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium mb-2">Upload Address Proof</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Utility bill, bank statement, or government correspondence
                </p>
                <Button variant="outline">
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Link to="/kyc/review">
              <Button size="lg" className="px-8">
                Continue to Review
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}