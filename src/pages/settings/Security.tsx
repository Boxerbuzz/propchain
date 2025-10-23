import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  MapPin,
  Globe,
  DollarSign,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Security = () => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false);

  // Language options - easily extendable
  const languages = [
    { code: "en", label: "English", flag: "🇬🇧", enabled: true },
    { code: "yo", label: "Yoruba", flag: "🇳🇬", enabled: false },
    { code: "ha", label: "Hausa", flag: "🇳🇬", enabled: false },
    { code: "ig", label: "Igbo", flag: "🇳🇬", enabled: false },
    // Easy to add more languages here
  ];
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Mock security data
  const securityStatus = {
    lastPasswordChange: "2024-08-15",
    twoFactorEnabled: true,
    backupCodesRemaining: 8,
    lastLogin: "2024-09-20 14:30:00",
    suspiciousActivity: false
  };

  const recentActivity = [
    {
      action: "Login",
      device: "MacBook Pro - Safari",
      location: "New York, NY",
      timestamp: "2024-09-20 14:30:00",
      status: "success"
    },
    {
      action: "Password Change",
      device: "iPhone 14 Pro - Safari",
      location: "New York, NY", 
      timestamp: "2024-08-15 09:15:00",
      status: "success"
    },
    {
      action: "Login Attempt",
      device: "Unknown Device - Chrome",
      location: "Los Angeles, CA",
      timestamp: "2024-09-18 22:45:00",
      status: "blocked"
    },
    {
      action: "2FA Setup",
      device: "MacBook Pro - Safari",
      location: "New York, NY",
      timestamp: "2024-07-10 16:20:00",
      status: "success"
    }
  ];

  const activeSessions = [
    {
      device: "MacBook Pro",
      browser: "Safari 17.0",
      location: "New York, NY",
      lastActive: "Active now",
      current: true
    },
    {
      device: "iPhone 14 Pro",
      browser: "Safari Mobile",
      location: "New York, NY",
      lastActive: "2 hours ago",
      current: false
    }
  ];

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    // In real app, validate current password and update
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const enableTwoFactor = () => {
    // In real app, show QR code setup flow
    toast({
      title: "2FA Setup",
      description: "Two-factor authentication setup would be initiated",
    });
  };

  const downloadBackupCodes = () => {
    // In real app, generate and download backup codes
    toast({
      title: "Backup Codes",
      description: "Backup codes would be downloaded",
    });
  };

  const terminateSession = (sessionDevice: string) => {
    toast({
      title: "Session Terminated",
      description: `Signed out of ${sessionDevice}`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Security Settings</h1>
            <p className="text-muted-foreground">Protect your account and manage security preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
              <CardDescription>Overview of your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Strong Password</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Login Alerts</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Last password change</p>
                    <p className="font-medium">{securityStatus.lastPasswordChange}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Backup codes remaining</p>
                    <p className="font-medium">{securityStatus.backupCodesRemaining} of 10</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Last login</p>
                    <p className="font-medium">{securityStatus.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences - Moved to top for better accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Manage your display and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Currency
                </Label>
                <CurrencyToggle />
                <p className="text-xs text-muted-foreground">
                  Select your preferred currency for displaying prices and balances
                </p>
              </div>

              <Separator />

              {/* Language Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  Language
                </Label>
                <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={languagePopoverOpen}
                      className="w-full justify-between"
                    >
                      {selectedLanguage
                        ? languages.find((lang) => lang.code === selectedLanguage)?.flag + " " +
                          languages.find((lang) => lang.code === selectedLanguage)?.label
                        : "Select language..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search language..." />
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {languages.map((language) => (
                          <CommandItem
                            key={language.code}
                            value={language.code}
                            disabled={!language.enabled}
                            onSelect={(currentValue) => {
                              if (language.enabled) {
                                setSelectedLanguage(currentValue);
                                setLanguagePopoverOpen(false);
                                toast({
                                  title: "Language Updated",
                                  description: `Display language set to ${language.label}`,
                                });
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLanguage === language.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {language.flag} {language.label}
                            {!language.enabled && " (Coming Soon)"}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred language for the interface
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              
              <Button onClick={handlePasswordChange}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app to generate verification codes
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setTwoFactorEnabled(checked);
                    if (checked && !securityStatus.twoFactorEnabled) {
                      enableTwoFactor();
                    }
                  }}
                />
              </div>
              
              {twoFactorEnabled && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium mb-2">Backup Codes</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        You have {securityStatus.backupCodesRemaining} backup codes remaining.
                        These codes can be used if you lose access to your authenticator app.
                      </p>
                      <Button variant="outline" onClick={downloadBackupCodes}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Backup Codes
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Login Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Login Alerts</CardTitle>
              <CardDescription>Get notified of login attempts to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when someone logs into your account
                  </p>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices that are signed into your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{session.browser}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location} • {session.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => terminateSession(session.device)}
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Security Activity
              </CardTitle>
              <CardDescription>Review recent security events on your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.device}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.location} • {activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={activity.status === "success" ? "secondary" : "destructive"}
                      className={activity.status === "success" ? "bg-green-100 text-green-800" : ""}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;