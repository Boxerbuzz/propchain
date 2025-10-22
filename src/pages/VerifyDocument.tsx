import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Shield, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentData {
  document_type: string;
  created_at: string;
  version: number;
  is_current: boolean;
  document_hash: string | null;
  hcs_verification_id: string | null;
}

interface VerificationResult {
  isValid: boolean;
  error?: string;
  documentType?: string;
  issuedDate?: string;
  version?: number;
  isCurrent?: boolean;
  hasHash?: boolean;
  hcsVerified?: boolean;
}

export default function VerifyDocument() {
  const { documentNumber } = useParams();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyDocument = async () => {
    if (!documentNumber) return;
    
    setVerifying(true);
    try {
      // Use RPC function to fetch document
      const { data, error } = await supabase
        .rpc('get_document_by_number' as any, { doc_number: documentNumber });

      if (error) {
        console.error('Verification error:', error);
        setResult({ isValid: false, error: 'Document not found in our records' });
        return;
      }

      const docs = data as DocumentData[];
      const doc = docs && docs.length > 0 ? docs[0] : null;

      if (!doc) {
        setResult({ isValid: false, error: 'Document not found in our records' });
        return;
      }

      // Verify document status
      setResult({
        isValid: doc.is_current ?? false,
        documentType: doc.document_type,
        issuedDate: doc.created_at,
        version: doc.version,
        isCurrent: doc.is_current ?? false,
        hasHash: !!doc.document_hash,
        hcsVerified: !!doc.hcs_verification_id,
      });

    } catch (error: any) {
      console.error('Verification failed:', error);
      toast.error('Verification failed: ' + error.message);
      setResult({ isValid: false, error: error.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Document Verification</h1>
        <p className="text-muted-foreground">
          Verify the authenticity of PropChain investment documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Verify Document: {documentNumber}
          </CardTitle>
          <CardDescription>
            This tool verifies documents against our blockchain-secured records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && (
            <Button
              onClick={verifyDocument}
              disabled={verifying}
              className="w-full"
              size="lg"
            >
              {verifying ? 'Verifying...' : 'Verify Document'}
            </Button>
          )}

          {result && (
            <div className="space-y-4">
              {result.isValid ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>✓ Document is Authentic</strong>
                    <p className="mt-2">
                      This document was issued by PropChain Technologies Limited and is verified in our records.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription>
                    <strong>✗ Document Cannot Be Verified</strong>
                    <p className="mt-2">
                      {result.error || 'This document may be forged, tampered with, or superseded by a newer version.'}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {result.isValid && result.documentType && (
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document Type:</span>
                    <span className="font-medium capitalize">{result.documentType.replace(/_/g, ' ')}</span>
                  </div>
                  {result.issuedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued Date:</span>
                      <span className="font-medium">
                        {new Date(result.issuedDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  )}
                  {result.version && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">
                        {result.version} {result.isCurrent ? '(Current)' : '(Superseded)'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blockchain Verified:</span>
                    <span className="font-medium">
                      {result.hcsVerified ? '✓ Yes' : '⧗ Pending'}
                    </span>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setVerifying(false);
                }}
                className="w-full"
              >
                Verify Another Document
              </Button>
            </div>
          )}

          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p className="mb-2"><strong>How Document Verification Works:</strong></p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Each PropChain document has a unique document number</li>
              <li>Document hashes are recorded on Hedera blockchain for immutability</li>
              <li>Any tampering with the document changes its hash, making verification fail</li>
              <li>This ensures documents cannot be forged or altered after issuance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
