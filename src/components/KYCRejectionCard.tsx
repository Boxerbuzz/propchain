import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface KYCRejectionCardProps {
  rejectionReason?: string | null;
  submittedAt?: string;
}

export default function KYCRejectionCard({ rejectionReason, submittedAt }: KYCRejectionCardProps) {
  const submissionDate = submittedAt ? new Date(submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : null;

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">Verification Rejected</AlertTitle>
        <AlertDescription className="mt-2">
          {rejectionReason || "Your previous KYC verification was not successful. Please review the common issues below and resubmit with updated documents."}
          {submissionDate && (
            <p className="mt-2 text-sm opacity-90">
              Previous submission: {submissionDate}
            </p>
          )}
        </AlertDescription>
      </Alert>

      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Common Rejection Reasons
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Poor image quality:</strong> Photos must be clear, well-lit, and in focus</li>
            <li>• <strong>Document mismatch:</strong> Information on documents must match your profile</li>
            <li>• <strong>Expired documents:</strong> All identification must be current and valid</li>
            <li>• <strong>Incomplete selfie:</strong> Face must be clearly visible and match ID photo</li>
            <li>• <strong>Invalid address proof:</strong> Utility bill or bank statement must be recent (within 3 months)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-info bg-info/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-3">Before You Resubmit</h3>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li>✓ Ensure all documents are clear and readable</li>
            <li>✓ Verify that personal information matches across all documents</li>
            <li>✓ Use good lighting and avoid glare or shadows</li>
            <li>✓ Make sure your selfie clearly shows your face</li>
            <li>✓ Check that documents are not expired</li>
          </ul>
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Note:</strong> When you resubmit, your previous submission data will be deleted and replaced with the new information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link to="/kyc/document-type">
          <Button size="lg" className="px-8">
            <RefreshCw className="w-4 h-4 mr-2" />
            Resubmit Verification
          </Button>
        </Link>
      </div>
    </div>
  );
}
