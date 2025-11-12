import { format } from "date-fns";
import {
  History,
  FileText,
  FileSignature,
  Receipt,
  Download,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DocumentVersion {
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
  document_hash?: string;
  qr_code_data?: string;
  investment_id?: string;
  property_id?: string;
  tokenization_id?: string;
  user_id?: string;
}

interface DocumentHistoryTimelineProps {
  documents: DocumentVersion[];
  onSelectDocument?: (doc: DocumentVersion) => void;
}

export default function DocumentHistoryTimeline({
  documents,
  onSelectDocument,
}: DocumentHistoryTimelineProps) {
  const sortedDocs = [...documents].sort((a, b) => {
    const aDate = new Date(a.version_date || a.generated_at).getTime();
    const bDate = new Date(b.version_date || b.generated_at).getTime();
    return bDate - aDate;
  });

  const formatDocumentType = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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
          Versioned records and update provenance for this investment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/40"></div>

          <div className="space-y-6">
            {sortedDocs.map((doc) => {
              const date = new Date(doc.version_date || doc.generated_at);

              const handleClick = () => {
                onSelectDocument?.(doc);
              };

              const handleKeyDown = (
                event: React.KeyboardEvent<HTMLDivElement>
              ) => {
                if (!onSelectDocument) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectDocument(doc);
                }
              };

              const IconComponent =
                doc.document_type === "agreement"
                  ? FileSignature
                  : doc.document_type === "receipt"
                  ? Receipt
                  : FileText;

              const interactive = Boolean(onSelectDocument);

              return (
                <div key={doc.id} className="relative pl-14">
                  {/* Timeline node */}
                  <div className="absolute left-3 top-4 z-10">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background shadow-sm ${
                        doc.is_current
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground"
                      }`}
                    >
                      {doc.is_current ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <IconComponent className="h-3 w-3" />
                      )}
                    </div>
                  </div>

                  {/* Timeline item content */}
                  <div
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    {...(interactive && { role: "button", tabIndex: 0 })}
                    className={`relative rounded-lg border bg-card p-4 transition-all ${
                      interactive
                        ? "cursor-pointer hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                        : ""
                    } ${
                      doc.is_current
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {formatDocumentType(doc.document_type)}
                          </h4>
                          <Badge
                            variant={doc.is_current ? "default" : "secondary"}
                            className="text-xs"
                          >
                            Version {doc.version}
                          </Badge>
                          {doc.is_current && (
                            <Badge
                              variant="default"
                              className="text-xs bg-primary"
                            >
                              Current
                            </Badge>
                          )}
                        </div>

                        {doc.document_number && (
                          <p className="text-sm text-muted-foreground mb-1 hidden">
                            {doc.document_number}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <span>{format(date, "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span>{format(date, "h:mm a")}</span>
                        </div>

                        {doc.reason_for_update && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {doc.reason_for_update}
                          </p>
                        )}
                      </div>

                      {interactive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                          }}
                          className="flex-shrink-0 hidden"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
