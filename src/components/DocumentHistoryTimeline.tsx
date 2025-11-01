import { format } from "date-fns";
import { History, FileText, FileSignature, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
        <div>
          {sortedDocs.map((doc, index) => {
            const isFirst = index === 0;
            const isLast = index === sortedDocs.length - 1;
              const subtitleParts = [
                doc.document_number,
                format(new Date(doc.version_date || doc.generated_at), "PP, p"),
              ].filter(Boolean);

              const handleClick = () => {
                onSelectDocument?.(doc);
              };

              const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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

              const content = (
                <div className="relative pl-14">
                  <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center">
                    <div className="flex h-full flex-col items-center">
                      <div
                        className={`w-px flex-1 ${
                          isFirst ? "hidden" : "bg-border/60"
                        }`}
                        style={{ marginBottom: isFirst ? 0 : "0.5rem" }}
                      />
                      <div
                        className={`flex aspect-square h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground ${
                          doc.is_current
                            ? "border-primary/60 text-primary"
                            : "border-border/60"
                        }`}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div
                        className={`w-px flex-1 ${
                          isLast ? "hidden" : "bg-border/60"
                        }`}
                        style={{ marginTop: isLast ? 0 : "0.5rem" }}
                      />
                    </div>
                  </div>
                  <p className="ml-6 text-sm font-medium text-foreground">
                    {formatDocumentType(doc.document_type)} • Version {doc.version}
                  </p>
                  <p className="ml-6 text-xs text-muted-foreground">
                    {subtitleParts.join(" • ")}
                  </p>
                </div>
              );

              const interactive = Boolean(onSelectDocument);
              const interactiveProps = interactive
                ? ({ role: "button", tabIndex: 0 } as const)
                : undefined;

              return (
                <div
                  key={doc.id}
                  className={index < sortedDocs.length - 1 ? "pb-6" : undefined}
                >
                  <div
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    {...(interactiveProps || {})}
                    className={`rounded-md transition ${
                      interactive
                        ? "cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        : ""
                    }`}
                  >
                    {content}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
