import { FileText, Download, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvestmentDocumentCardProps {
  document: {
    id: string;
    document_type: 'agreement' | 'receipt';
    document_url: string;
    document_number: string;
    generated_at: string;
    metadata?: any;
  };
  onPreview?: (url: string) => void;
}

export default function InvestmentDocumentCard({ document, onPreview }: InvestmentDocumentCardProps) {
  const isAgreement = document.document_type === 'agreement';
  
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('investment-documents')
        .download(document.document_url);
      
      if (error) throw error;
      
      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.document_type}-${document.document_number}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handlePreview = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('investment-documents')
        .createSignedUrl(document.document_url, 3600); // 1 hour expiry
      
      if (error) throw error;
      if (data?.signedUrl && onPreview) {
        onPreview(data.signedUrl);
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error('Failed to preview document');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isAgreement ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                {isAgreement ? 'Investment Agreement' : 'Investment Receipt'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {document.document_number}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Generated:</span>
            <span className="font-medium">
              {format(new Date(document.generated_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          {document.metadata?.amount_ngn && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                ₦{document.metadata.amount_ngn.toLocaleString()}
              </span>
            </div>
          )}
          {isAgreement && document.metadata?.tokens_requested && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tokens:</span>
              <span className="font-medium">
                {document.metadata.tokens_requested.toLocaleString()}
              </span>
            </div>
          )}
          {!isAgreement && document.metadata?.payment_reference && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-medium text-xs">
                {document.metadata.payment_reference.substring(0, 16)}...
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
