import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Building2,
  Users,
  Shield,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Email notifications
    emailDividends: true,
    emailProperties: true,
    emailGovernance: true,
    emailSecurity: true,
    emailMarketing: false,
    emailWeekly: true,
    
    // Push notifications
    pushDividends: true,
    pushProperties: false,
    pushGovernance: true,
    pushSecurity: true,
    pushMessages: true,
    pushPrice: false,
    
    // SMS notifications
    smsSecurity: true,
    smsDividends: false,
    smsGovernance: false,
    
    // In-app notifications
    inAppAll: true,
    inAppMessages: true,
    inAppUpdates: true
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // In real app, save to backend
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const NotificationSection = ({ 
    icon: Icon, 
    title, 
    description, 
    settings: sectionSettings 
  }: {
    icon: any,
    title: string,
    description: string,
    settings: { key: string, label: string, description: string }[]
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sectionSettings.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label htmlFor={key} className="font-medium">{label}</Label>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={key}
              checked={settings[key as keyof typeof settings]}
              onCheckedChange={(checked) => updateSetting(key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">Manage how you receive updates and alerts</p>
          </div>
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <NotificationSection
            icon={Mail}
            title="Email Notifications"
            description="Receive updates via email"
            settings={[
              {
                key: "emailDividends",
                label: "Dividend Payments",
                description: "Get notified when you receive dividend payments"
              },
              {
                key: "emailProperties",
                label: "New Properties",
                description: "Updates about new investment opportunities"
              },
              {
                key: "emailGovernance",
                label: "Governance Votes",
                description: "Notifications about voting opportunities"
              },
              {
                key: "emailSecurity",
                label: "Security Alerts",
                description: "Important security and account updates"
              },
              {
                key: "emailWeekly",
                label: "Weekly Summary",
                description: "Weekly portfolio performance summary"
              },
              {
                key: "emailMarketing",
                label: "Marketing Updates",
                description: "News and promotional content"
              }
            ]}
          />

          {/* Push Notifications */}
          <NotificationSection
            icon={Bell}
            title="Push Notifications"
            description="Real-time notifications on your device"
            settings={[
              {
                key: "pushDividends",
                label: "Dividend Payments",
                description: "Instant alerts for dividend distributions"
              },
              {
                key: "pushProperties",
                label: "New Properties",
                description: "Immediate notifications for new listings"
              },
              {
                key: "pushGovernance",
                label: "Governance",
                description: "Voting deadlines and results"
              },
              {
                key: "pushSecurity",
                label: "Security",
                description: "Critical security notifications"
              },
              {
                key: "pushMessages",
                label: "Messages",
                description: "New messages and community updates"
              },
              {
                key: "pushPrice",
                label: "Price Alerts",
                description: "Significant property value changes"
              }
            ]}
          />

          {/* SMS Notifications */}
          <NotificationSection
            icon={MessageSquare}
            title="SMS Notifications"
            description="Text message alerts for critical updates"
            settings={[
              {
                key: "smsSecurity",
                label: "Security Alerts",
                description: "Critical security notifications via SMS"
              },
              {
                key: "smsDividends",
                label: "Dividend Payments",
                description: "SMS alerts for dividend distributions"
              },
              {
                key: "smsGovernance",
                label: "Urgent Governance",
                description: "Time-sensitive voting notifications"
              }
            ]}
          />

          {/* In-App Notifications */}
          <NotificationSection
            icon={Building2}
            title="In-App Notifications"
            description="Notifications within the application"
            settings={[
              {
                key: "inAppAll",
                label: "All Notifications",
                description: "Show all in-app notification types"
              },
              {
                key: "inAppMessages",
                label: "Messages",
                description: "Community messages and discussions"
              },
              {
                key: "inAppUpdates",
                label: "Property Updates",
                description: "Property performance and news updates"
              }
            ]}
          />

          {/* Notification Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>Overview of notification types and their importance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Financial</p>
                      <p className="text-sm text-green-700 dark:text-green-200">Dividends, payments, returns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Properties</p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">New listings, updates, performance</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Community</p>
                      <p className="text-sm text-purple-700 dark:text-purple-200">Messages, governance, voting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Security</p>
                      <p className="text-sm text-red-700 dark:text-red-200">Account alerts, login attempts</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>Set times when you don't want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quietStart">Start Time</Label>
                  <input
                    id="quietStart"
                    type="time"
                    defaultValue="22:00"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="quietEnd">End Time</Label>
                  <input
                    id="quietEnd"
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                During quiet hours, only critical security notifications will be sent.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;