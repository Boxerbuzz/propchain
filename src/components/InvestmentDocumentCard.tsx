import { FileText, Download, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DocumentVersion } from "./DocumentHistoryTimeline";

interface InvestmentDocumentCardProps {
  document: (DocumentVersion & { document_type: "agreement" | "receipt" }) & {
    metadata?: any;
  };
  onOpenDetails?: (document: DocumentVersion) => void;
}

export default function InvestmentDocumentCard({
  document,
  onOpenDetails,
}: InvestmentDocumentCardProps) {
  const isAgreement = document.document_type === "agreement";

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("investment-documents")
        .download(document.document_url);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.document_type}-${document.document_number}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };

  return (
    <Card className="border border-border/60 shadow-none">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-1 items-start gap-3">
          <div
            className={`rounded-full border border-border/60 p-2 text-muted-foreground ${
              isAgreement ? "bg-primary/5" : "bg-emerald-500/5"
            }`}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isAgreement ? "Investment Agreement" : "Investment Receipt"}
            </p>
            <p className="text-xs text-muted-foreground">
              {document.document_number}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Generated{" "}
                {format(new Date(document.generated_at), "MMM dd, yyyy")}
              </span>
              {document.metadata?.amount_ngn && (
                <span>
                  Amount ₦{document.metadata.amount_ngn.toLocaleString()}
                </span>
              )}
              {isAgreement && document.metadata?.tokens_requested && (
                <span>
                  Tokens {document.metadata.tokens_requested.toLocaleString()}
                </span>
              )}
              {!isAgreement && document.metadata?.payment_reference && (
                <span>
                  Ref {document.metadata.payment_reference.substring(0, 10)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Document actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              <DropdownMenuItem
                onClick={() => onOpenDetails?.(document)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
