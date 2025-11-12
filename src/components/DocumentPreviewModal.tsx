"use client";

import { useMemo, useState, type ComponentType } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Copy,
  Check,
  X,
  Hash,
  Landmark,
  Building2,
  User,
  FileKey2,
  Link,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DocumentVersion } from "./DocumentHistoryTimeline";
import { Spinner } from "./ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocIdRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}

const DocIdRow = ({ icon: Icon, label, value }: DocIdRowProps) => {
  const masked = maskIdentifier(value);
  const showCopy = Boolean(value);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedId(false), 1500);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="rounded-md border border-border/50 bg-card/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {showCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                aria-label={`Copy ${label}`}
              >
                {copiedId ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            <span className="truncate" title={value || "—"}>
              {masked}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document:
    | (DocumentVersion & {
        investment_id?: string;
        property_id?: string;
        tokenization_id?: string;
        user_id?: string;
        qr_code_data?: string;
        document_hash?: string;
      })
    | null;
}

const formatDocumentType = (type?: string) =>
  (type || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Document";

const formatCurrency = (value?: number) =>
  typeof value === "number" ? `₦${value.toLocaleString()}` : undefined;

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined;

const maskIdentifier = (value?: string) => {
  if (!value || value.length <= 10) return value || "—";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const getHashscanUrl = (doc: DocumentPreviewModalProps["document"]) => {
  if (!doc) return null;
  const metadata = doc.metadata || {};
  const directUrl =
    metadata.hashscanUrl || metadata.hashscan_url || metadata.hash_url;
  if (directUrl && typeof directUrl === "string") return directUrl;

  const hash =
    metadata.transactionHash ||
    metadata.transaction_hash ||
    metadata.receipt_hash ||
    metadata.hash ||
    doc.document_hash;
  if (!hash) return null;

  const network = metadata.network || "testnet";
  return `https://hashscan.io/#/${network}/transaction/${hash}`;
};

export default function DocumentPreviewModal({
  open,
  onOpenChange,
  document,
}: DocumentPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const metadata = document?.metadata ?? {};
  const hashscanUrl = getHashscanUrl(document);

  const detailEntries = useMemo(
    () =>
      [
        { label: "Investor", value: metadata.investor_name },
        { label: "Property", value: metadata.property_title },
        { label: "Amount", value: formatCurrency(metadata.amount_ngn) },
        {
          label: "Tokens",
          value:
            typeof metadata.tokens_requested === "number"
              ? metadata.tokens_requested.toLocaleString()
              : undefined,
        },
        {
          label: "Tokens Held",
          value:
            typeof metadata.tokens_held === "number"
              ? metadata.tokens_held.toLocaleString()
              : undefined,
        },
        {
          label: "Tokenization Type",
          value: capitalize(metadata.tokenization_type),
        },
        {
          label: "Payment Reference",
          value: maskIdentifier(metadata.payment_reference),
        },
        { label: "Network", value: metadata.network },
        { label: "Updated By", value: metadata.updated_by },
      ].filter((item) => item.value),
    [metadata]
  );

  const handleDownload = async () => {
    if (!document) return;
    try {
      setDownloading(true);
      const { data, error } = await supabase.storage
        .from("investment-documents")
        .download(document.document_url);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.document_type}-${document.document_number}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document download started");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyHash = async () => {
    if (!document?.document_hash) return;
    try {
      await navigator.clipboard.writeText(document.document_hash);
      setCopied(true);
      toast.success("Document hash copied");
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy hash");
    }
  };

  if (!document) {
    return null;
  }

  const generatedAt = format(
    new Date(document.version_date || document.generated_at),
    "PPP 'at' p"
  );

  const ContentComponent = () => {
    return (
      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Version {document.version}
          </Badge>
          <span className="text-border">•</span>
          <span>
            {document.is_current ? "Current version" : "Archived version"}
          </span>
          <span className="text-border">•</span>
          <span>{generatedAt}</span>
          {document.reason_for_update && (
            <>
              <span className="text-border">•</span>
              <span>Reason: {document.reason_for_update}</span>
            </>
          )}
        </div>

        {(document.document_hash || hashscanUrl) && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" /> Hash
            </span>
            {document.document_hash && (
              <span className="break-all font-mono text-muted-foreground">
                {maskIdentifier(document.document_hash)}
              </span>
            )}
            <div className="flex items-center gap-2">
              {document.document_hash && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={handleCopyHash}
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
              {hashscanUrl && (
                <a
                  href={hashscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Link className="h-3 w-3" /> View on HashScan
                </a>
              )}
            </div>
          </div>
        )}

        {detailEntries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {detailEntries.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-border/50 bg-card/40 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {metadata.notes && (
          <div className="rounded-md border border-border/50 bg-card/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes
            </p>
            <p className="text-sm text-foreground">{metadata.notes}</p>
          </div>
        )}

        {document.qr_code_data && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/60 bg-card/30 px-6 py-6">
            <img
              src={document.qr_code_data}
              alt="Document QR code"
              className="h-40 w-40 rounded-md border border-border/60 bg-white p-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              Scan to verify or share this investment document.
            </p>
          </div>
        )}

        <Separator />

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <DocIdRow
            icon={Landmark}
            label="Investment ID"
            value={document.investment_id}
          />
          <DocIdRow
            icon={FileKey2}
            label="Tokenization ID"
            value={document.tokenization_id}
          />
          <DocIdRow
            icon={Building2}
            label="Property ID"
            value={document.property_id}
          />
          <DocIdRow icon={User} label="User ID" value={document.user_id} />
        </div>
      </div>
    );
  };

  if (!isMobile) {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setCopied(false);
          }
          onOpenChange(next);
        }}
        modal={true}
      >
        <DialogContent
          className="max-w-3xl w-full gap-0 p-0 "
          showCloseButton={false}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {formatDocumentType(document.document_type)}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {document.document_number}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download className="h-4 w-4" />
                  {downloading && (
                    <Spinner size={16} className="text-primary ml-2" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ContentComponent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCopied(false);
        }
        onOpenChange(next);
      }}
      modal={true}
    >
      <DrawerContent className="max-w-3xl w-full gap-0 p-0 flex flex-col overflow-hidden">
        <DrawerHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold">
                {formatDocumentType(document.document_type)}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                #{document.document_number}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="h-4 w-4" />
                {downloading && (
                  <Spinner size={16} className="text-primary ml-2" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <ContentComponent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
