import { format } from "date-fns";
import { FileText, Download, Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentVersion {
  id: string;
  document_type: string;
  document_number: string;
  document_url: string;
  version: number;
  version_date: string;
  is_current: boolean;
  reason_for_update?: string;
  superseded_by?: string;
  metadata?: any;
  generated_at: string;
}

interface DocumentHistoryTimelineProps {
  documents: DocumentVersion[];
  onPreview: (url: string, title: string) => void;
}

export default function DocumentHistoryTimeline({
  documents,
  onPreview,
}: DocumentHistoryTimelineProps) {
  const { toast } = useToast();

  const handleDownload = async (doc: DocumentVersion) => {
    try {
      const { data, error } = await supabase.storage
        .from("investment-documents")
        .download(doc.document_url);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.document_type}-${doc.document_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your document is downloading",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (doc: DocumentVersion) => {
    try {
      const { data, error } = await supabase.storage
        .from("investment-documents")
        .createSignedUrl(doc.document_url, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        onPreview(
          data.signedUrl,
          `${doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)} - ${doc.document_number}`
        );
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Group documents by type
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, DocumentVersion[]>);

  // Sort documents by version (newest first)
  Object.keys(groupedDocs).forEach(type => {
    groupedDocs[type].sort((a, b) => b.version - a.version);
  });

  const getDocumentIcon = (type: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getDocumentTitle = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Document History
          </CardTitle>
          <CardDescription>No documents available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Document History
        </CardTitle>
        <CardDescription>
          All versions of your investment documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([type, docs]) => (
            <div key={type} className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                {getDocumentIcon(type)}
                {getDocumentTitle(type)}
              </h4>
              <div className="space-y-3 ml-7">
                {docs.map((doc, index) => (
                  <div
                    key={doc.id}
                    className={`relative border rounded-lg p-4 ${
                      doc.is_current ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    {/* Timeline connector */}
                    {index < docs.length - 1 && (
                      <div className="absolute left-0 top-12 bottom-0 w-px bg-border -ml-4" />
                    )}

                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-6 w-2 h-2 rounded-full -ml-5 ${
                        doc.is_current ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                    />

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Version {doc.version}</span>
                          {doc.is_current && (
                            <Badge className="bg-primary text-primary-foreground">
                              Current
                            </Badge>
                          )}
                          {!doc.is_current && (
                            <Badge variant="outline">Superseded</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Document #: {doc.document_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Generated: {format(new Date(doc.version_date || doc.generated_at), "PPP 'at' p")}
                        </p>
                        {doc.reason_for_update && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Reason:</span> {doc.reason_for_update}
                          </p>
                        )}
                        {doc.metadata && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {doc.metadata.property_title && (
                              <p>Property: {doc.metadata.property_title}</p>
                            )}
                            {doc.metadata.amount_ngn && (
                              <p>Amount: ₦{doc.metadata.amount_ngn.toLocaleString()}</p>
                            )}
                            {doc.metadata.tokens_held && (
                              <p>Tokens: {doc.metadata.tokens_held.toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
