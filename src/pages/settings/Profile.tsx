import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Upload,
  Shield,
  Verified,
  Edit,
  Info,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { stats } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modificationRequested, setModificationRequested] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    occupation: "",
    investmentExperience: "beginner",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.state_of_residence || "",
        dateOfBirth: user.date_of_birth
          ? typeof user.date_of_birth === "string"
            ? user.date_of_birth
            : user.date_of_birth.toISOString().split("T")[0]
          : "",
        occupation: user.occupation || "",
        investmentExperience: user.investment_experience || "beginner",
      });
    }
  }, [user]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Not set";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      console.log("💾 Saving profile for user:", user.id);
      console.log("📝 Form data:", formData);

      // Update user profile in database
      const { error } = await supabase
        .from("users")
        .update({
          occupation: formData.occupation || null,
          investment_experience: formData.investmentExperience,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("❌ Error updating profile:", error);
        throw new Error(error.message);
      }

      console.log("✅ Profile updated successfully");

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Refresh user data by triggering a re-fetch
      // The useAuth hook should handle this automatically
    } catch (error: any) {
      console.error("💥 Profile save failed:", error);
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModificationRequest = () => {
    setModificationRequested(true);
    toast({
      title: "Modification Request Sent",
      description:
        "Your request to modify personal details has been submitted. We'll review and get back to you within 24-48 hours.",
    });
  };

  const getKYCStatusInfo = (status: string | undefined) => {
    switch (status) {
      case "verified":
        return {
          message: "Identity verification complete",
          badgeText: "Complete",
          badgeClass: "bg-green-100 text-green-800",
          iconClass: "text-green-600",
          cardClass: "bg-green-50 dark:bg-green-950/20",
        };
      case "pending":
        return {
          message: "Identity verification is being reviewed",
          badgeText: "Under Review",
          badgeClass: "bg-blue-100 text-blue-800",
          iconClass: "text-blue-600",
          cardClass: "bg-blue-50 dark:bg-blue-950/20",
        };
      case "rejected":
        return {
          message: "Identity verification was rejected. Please resubmit.",
          badgeText: "Rejected",
          badgeClass: "bg-red-100 text-red-800",
          iconClass: "text-red-600",
          cardClass: "bg-red-50 dark:bg-red-950/20",
        };
      case "expired":
        return {
          message: "Identity verification has expired. Please reverify.",
          badgeText: "Expired",
          badgeClass: "bg-orange-100 text-orange-800",
          iconClass: "text-orange-600",
          cardClass: "bg-orange-50 dark:bg-orange-950/20",
        };
      case "not_started":
      default:
        return {
          message: "Identity verification not started",
          badgeText: "Not Done",
          badgeClass: "bg-gray-100 text-gray-800",
          iconClass: "text-gray-600",
          cardClass: "bg-gray-50 dark:bg-gray-950/20",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
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
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.firstName} ${formData.lastName}&backgroundColor=6366f1,8b5cf6,ec4899,10b981`}
                    />
                    <AvatarFallback className="text-2xl">
                      {formData.firstName[0]}
                      {formData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>
                  {formData.firstName || "User"} {formData.lastName}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {formData.email}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-2">
                  {user?.email_verified_at && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <Verified className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user?.kyc_status === "verified" && (
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

                <Link to="/system-docs" className="block mb-4">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    System Documentation
                  </Button>
                </Link>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Member Since
                    </span>
                    <span className="text-sm font-medium">
                      {user?.created_at
                        ? formatDate(user.created_at)
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Invested
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(stats.totalInvested)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Properties
                    </span>
                    <span className="text-sm font-medium">
                      {stats.propertiesCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Return
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(stats.totalReturns)}
                    </span>
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
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={true}
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
                    disabled={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      disabled={true}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Details Modification Notice */}
            {user?.kyc_status !== "verified" ? (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">
                        Personal Details Modification
                      </h3>
                      <p className="text-sm text-blue-700">
                        Personal details (name, email, phone, address, date of
                        birth) can only be modified through the KYC verification
                        process. Complete your identity verification to update
                        these details.
                      </p>
                      <Link to="/kyc/start" className="inline-block mt-2">
                        <Button size="sm" variant="default">
                          Complete KYC Verification
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-2 ${
                        user?.kyc_status === "verified"
                          ? "bg-green-400"
                          : "bg-amber-400"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 text-white mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800 mb-1">
                        Personal Details Modification
                      </h3>
                      <p className="text-sm text-green-700 mb-3">
                        Need to update your personal details? Submit a
                        modification request and our team will review it.
                      </p>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleModificationRequest}
                        disabled={modificationRequested}
                      >
                        {modificationRequested ? (
                          <>Request Received</>
                        ) : (
                          <>Request Modification</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>
                  Your investment preferences and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) =>
                        handleInputChange("occupation", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Investment Experience</Label>
                    <select
                      title="Investment Experience"
                      id="experience"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
                      value={formData.investmentExperience}
                      onChange={(e) =>
                        handleInputChange(
                          "investmentExperience",
                          e.target.value
                        )
                      }
                      disabled={!isEditing}
                    >
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">
                        Intermediate (2-5 years)
                      </option>
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
                <CardDescription>
                  Your account verification and security status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user?.email_verified_at
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-amber-50 dark:bg-amber-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          user?.phone_verified_at
                            ? "bg-green-400"
                            : "bg-amber-400"
                        }`}
                      >
                        <Verified
                          className={`h-5 w-5 ${
                            user?.phone_verified_at
                              ? "text-white"
                              : "text-white"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">Email Verified</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email_verified_at
                            ? "Your email has been verified"
                            : "Please verify your email address"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        user?.email_verified_at
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {user?.email_verified_at ? "Complete" : "Pending"}
                    </Badge>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      getKYCStatusInfo(user?.kyc_status).cardClass
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          user?.phone_verified_at
                            ? "bg-green-400"
                            : "bg-amber-400"
                        }`}
                      >
                        <Shield className={`h-5 w-5 ${"text-white"}`} />
                      </div>
                      <div>
                        <p className="font-medium">KYC Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {getKYCStatusInfo(user?.kyc_status).message}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={getKYCStatusInfo(user?.kyc_status).badgeClass}
                    >
                      {getKYCStatusInfo(user?.kyc_status).badgeText}
                    </Badge>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user?.phone_verified_at
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-amber-50 dark:bg-amber-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          user?.phone_verified_at
                            ? "bg-green-400"
                            : "bg-amber-400"
                        }`}
                      >
                        <Phone
                          className={`h-5 w-5 ${
                            user?.phone_verified_at
                              ? "text-white"
                              : "text-white"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.phone_verified_at
                            ? "Phone number verified"
                            : "Please verify your phone number"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        user?.phone_verified_at
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {user?.phone_verified_at ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
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
