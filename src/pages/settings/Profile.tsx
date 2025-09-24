import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Upload,
  Shield,
  Verified,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboard } from "@/hooks/useDashboard";

const Profile = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();
  const { stats } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    dateOfBirth: "",
    occupation: "",
    investmentExperience: "beginner"
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.state_of_residence || "",
        bio: "",
        dateOfBirth: user.date_of_birth ? (typeof user.date_of_birth === 'string' ? user.date_of_birth : user.date_of_birth.toISOString().split('T')[0]) : "",
        occupation: user.occupation || "",
        investmentExperience: user.investment_experience || "beginner"
      });
    }
  }, [user]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Not set";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSave = () => {
    // In real app, save to backend
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-2xl">
                      {formData.firstName[0]}{formData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{formData.firstName || "User"} {formData.lastName}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {formData.email}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-2">
                  {user?.email_verified_at && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Verified className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user?.kyc_status === 'verified' && (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      KYC Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full mb-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm font-medium">{user?.created_at ? formatDate(user.created_at) : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Invested</span>
                    <span className="text-sm font-medium">{formatCurrency(stats.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Properties</span>
                    <span className="text-sm font-medium">{stats.propertiesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Return</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(stats.totalReturns)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Investment Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>Your investment preferences and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Investment Experience</Label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
                      value={formData.investmentExperience}
                      onChange={(e) => handleInputChange("investmentExperience", e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="advanced">Advanced (5+ years)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your account verification and security status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    user?.email_verified_at ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Verified className={`h-5 w-5 ${user?.email_verified_at ? 'text-green-600' : 'text-amber-600'}`} />
                      <div>
                        <p className="font-medium">Email Verified</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email_verified_at ? 'Your email has been verified' : 'Please verify your email address'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={
                      user?.email_verified_at 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }>
                      {user?.email_verified_at ? 'Complete' : 'Pending'}
                    </Badge>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    user?.kyc_status === 'verified' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Shield className={`h-5 w-5 ${user?.kyc_status === 'verified' ? 'text-green-600' : 'text-amber-600'}`} />
                      <div>
                        <p className="font-medium">KYC Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.kyc_status === 'verified' 
                            ? 'Identity verification complete' 
                            : `Identity verification ${user?.kyc_status || 'not started'}`
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={
                      user?.kyc_status === 'verified' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }>
                      {user?.kyc_status === 'verified' ? 'Complete' : 'Pending'}
                    </Badge>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    user?.phone_verified_at ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Phone className={`h-5 w-5 ${user?.phone_verified_at ? 'text-green-600' : 'text-amber-600'}`} />
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.phone_verified_at ? 'Phone number verified' : 'Please verify your phone number'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={
                      user?.phone_verified_at 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }>
                      {user?.phone_verified_at ? 'Complete' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;