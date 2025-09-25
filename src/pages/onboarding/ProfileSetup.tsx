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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowLeft, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useHederaAccount } from "@/hooks/useHederaAccount";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileSetup() {
  const { hasAccount, createAccount, isCreating } = useHederaAccount();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/onboarding/welcome">
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
              <span className="text-sm text-muted-foreground">Step 2 of 3</span>
              <Progress value={66} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Help us personalize your PropChain experience
          </p>
        </div>

        <form className="space-y-8">
          {/* Profile Picture */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">JD</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Button variant="outline">Upload Photo</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+234 xxx xxx xxxx" />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter your full address" />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" placeholder="Your job title" />
                </div>
                <div>
                  <Label htmlFor="employer">Employer</Label>
                  <Input id="employer" placeholder="Company/Organization" />
                </div>
              </div>

              <div>
                <Label htmlFor="income">Annual Income Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1m">Under ₦1,000,000</SelectItem>
                    <SelectItem value="1m-5m">
                      ₦1,000,000 - ₦5,000,000
                    </SelectItem>
                    <SelectItem value="5m-10m">
                      ₦5,000,000 - ₦10,000,000
                    </SelectItem>
                    <SelectItem value="10m-20m">
                      ₦10,000,000 - ₦20,000,000
                    </SelectItem>
                    <SelectItem value="over-20m">Over ₦20,000,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Investment Experience */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Investment Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">
                  Real Estate Investment Experience
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      Beginner (0-1 years)
                    </SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate (2-5 years)
                    </SelectItem>
                    <SelectItem value="experienced">
                      Experienced (5+ years)
                    </SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="investmentGoals">Investment Goals</Label>
                <Textarea
                  id="investmentGoals"
                  placeholder="Tell us about your investment goals and preferences"
                />
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Wallet Setup */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Blockchain Wallet Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasAccount ? (
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Your blockchain wallet has been created successfully. You're ready to start investing!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We'll create a secure blockchain wallet for you to hold your tokenized real estate investments. 
                    This wallet uses Hedera's enterprise-grade security.
                  </p>
                  <Button
                    type="button"
                    onClick={() => createAccount()}
                    disabled={isCreating}
                    className="w-full"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isCreating ? 'Creating Wallet...' : 'Create Blockchain Wallet'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="px-8">
              Save as Draft
            </Button>
            <Link to="/auth/verify-phone">
              <Button size="lg" className="px-8">
                Continue to Verification
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}