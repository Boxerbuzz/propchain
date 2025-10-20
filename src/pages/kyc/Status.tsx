import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function KYCStatus() {
  // This would normally come from API/state
  const kycStatus = "pending" as
    | "pending"
    | "verified"
    | "rejected"
    | "under_review";

  const getStatusConfig = () => {
    switch (kycStatus) {
      case "verified":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Verification Complete",
          description: "Your identity has been successfully verified",
          badge: {
            variant: "default",
            text: "Verified",
            className: "bg-green-100 text-green-800",
          },
        };
      case "rejected":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Verification Failed",
          description: "Your verification was unsuccessful. Please try again.",
          badge: {
            variant: "destructive",
            text: "Rejected",
            className: "bg-red-100 text-red-800",
          },
        };
      case "under_review":
        return {
          icon: HelpCircle,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "Under Manual Review",
          description: "Our team is reviewing your documents manually",
          badge: {
            variant: "outline",
            text: "Under Review",
            className: "bg-amber-100 text-amber-800",
          },
        };
      default: // pending
        return {
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Verification in Progress",
          description: "We're processing your verification documents",
          badge: {
            variant: "outline",
            text: "Pending",
            className: "bg-blue-100 text-blue-800",
          },
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const timeline = [
    {
      title: "Documents Submitted",
      completed: true,
      time: "2 minutes ago",
    },
    {
      title: "Automatic Verification",
      completed: kycStatus !== "pending",
      time: kycStatus === "pending" ? "In progress..." : "1 minute ago",
    },
    {
      title: "Manual Review",
      completed: kycStatus === "verified",
      time:
        kycStatus === "under_review"
          ? "In progress..."
          : kycStatus === "verified"
          ? "Completed"
          : "Waiting...",
    },
    {
      title: "Verification Complete",
      completed: kycStatus === "verified",
      time: kycStatus === "verified" ? "Just now" : "Pending...",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                PC
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">PropChain</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <Card
            className={`border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} mb-8`}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-20 h-20 ${statusConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <StatusIcon className={`w-10 h-10 ${statusConfig.color}`} />
              </div>

              <div className="mb-4">
                <Badge className={statusConfig.badge.className}>
                  {statusConfig.badge.text}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold mb-2 text-black dark:text-black">
                {statusConfig.title}
              </h1>

              <p className="text-muted-foreground">
                {statusConfig.description}
              </p>

              {kycStatus === "pending" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Processing...</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.completed ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {kycStatus === "verified" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Congratulations! Your account is now fully verified. You
                    can:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Access all investment opportunities</li>
                    <li>• Enjoy higher transaction limits</li>
                    <li>• Set up your wallet</li>
                    <li>• Start investing in properties</li>
                  </ul>
                </div>
              ) : kycStatus === "rejected" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your verification was unsuccessful. Common reasons include:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Poor image quality or unclear documents</li>
                    <li>• Mismatched information between documents</li>
                    <li>• Expired or invalid documents</li>
                    <li>• Documents not issued by Nigerian authorities</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your verification is being processed. You'll receive an
                    email notification once complete.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Automatic verification: 2-5 minutes</li>
                    <li>• Manual review (if needed): 1-3 business days</li>
                    <li>• Email notification upon completion</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            {kycStatus === "verified" ? (
              <Link to="/wallet/setup">
                <Button size="lg" className="px-8">
                  Set Up Wallet
                </Button>
              </Link>
            ) : kycStatus === "rejected" ? (
              <Link to="/kyc/start">
                <Button size="lg" className="px-8">
                  Try Again
                </Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="px-8">
                  Go to Dashboard
                </Button>
              </Link>
            )}

            <div>
              <Link to="/support">
                <Button variant="ghost">Need Help? Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
