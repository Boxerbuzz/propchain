import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import KYCRejectionCard from "@/components/KYCRejectionCard";
import { useEffect } from "react";

export default function KYCStart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['kyc-status-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status, rejection_reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching KYC status:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Redirect if already pending or approved
  useEffect(() => {
    if (kycData) {
      if (kycData.status === 'pending') {
        navigate('/kyc/status');
      } else if (kycData.status === 'approved') {
        navigate('/kyc/status');
      }
    }
  }, [kycData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show rejection UI if status is rejected
  if (kycData?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Verify Your Identity
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your previous verification was not successful. Please review the feedback below and resubmit.
            </p>
          </div>

          <KYCRejectionCard 
            rejectionReason={kycData.rejection_reason}
            submittedAt={kycData.created_at}
          />

          <div className="text-center mt-8">
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="px-8">
                Maybe Later
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Verify Your Identity
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To comply with regulations and secure your account, we need to
            verify your identity. This process typically takes 5-10 minutes.
          </p>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            Estimated time: 5-10 minutes
          </Badge>
        </div>

        {/* Required Documents */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Government ID</h3>
                <p className="text-sm text-muted-foreground">
                  NIN, Driver's License, or International Passport
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Selfie Photo</h3>
                <p className="text-sm text-muted-foreground">
                  Clear photo of yourself for identity verification
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Address Proof</h3>
                <p className="text-sm text-muted-foreground">
                  Utility bill or bank statement (not older than 3 months)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle>Why Verify Your Identity?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Access to all investment opportunities
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Higher transaction limits
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Enhanced security for your account
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Compliance with financial regulations
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-2">Your Privacy is Protected</h3>
          <p className="text-sm text-muted-foreground">
            All documents are encrypted and stored securely. We never share your
            personal information with third parties without your consent. Your
            data is protected by bank-level security measures.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <Link to="/kyc/document-type">
            <Button size="lg" className="px-8 mr-4">
              Start Verification
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="px-8">
              Maybe Later
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
