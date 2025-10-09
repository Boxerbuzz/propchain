import { Receipt, User, DollarSign, Calendar, FileCheck } from "lucide-react";
import { EventAccordion } from "./EventAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";

interface PurchaseEventMessageProps {
  metadata: any;
  createdAt: string;
}

export const PurchaseEventMessage = ({ metadata, createdAt }: PurchaseEventMessageProps) => {
  const getTransactionStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      pending: "secondary",
      signed: "outline",
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  return (
    <EventAccordion
      icon={Receipt}
      title={`${metadata.transaction_type || "Property"} Transaction`}
      subtitle={`${metadata.buyer_name || "Buyer"} • ${formatDistanceToNow(new Date(createdAt), { addSuffix: true })}`}
      badge={{
        label: metadata.transaction_status || "Pending",
        variant: getTransactionStatusBadge(metadata.transaction_status),
      }}
    >
      <div className="space-y-4">
        {/* Transaction Summary */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Purchase Price</span>
            {metadata.percentage_sold && (
              <Badge variant="secondary">{metadata.percentage_sold}% of property</Badge>
            )}
          </div>
          <p className="text-2xl font-bold">₦{metadata.purchase_price_ngn?.toLocaleString()}</p>
          {metadata.purchase_price_usd && (
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${metadata.purchase_price_usd?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Buyer Information */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Transaction Parties
          </h5>
          <div className="grid gap-2 text-sm">
            {metadata.buyer_name && (
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Buyer:</span>
                <span className="font-medium">{metadata.buyer_name}</span>
              </div>
            )}
            {metadata.seller_name && (
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-medium">{metadata.seller_name}</span>
              </div>
            )}
            {metadata.buyer_email && (
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium text-xs">{metadata.buyer_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Plan */}
        {metadata.payment_plan !== "outright" && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Plan
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Down Payment</p>
                <p className="font-semibold">₦{metadata.down_payment_ngn?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                <p className="font-semibold">₦{metadata.remaining_balance_ngn?.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <Badge variant="outline">{metadata.payment_plan} Payment Plan</Badge>
            </div>
          </div>
        )}

        {/* Token Information */}
        {metadata.tokens_involved && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tokens Involved:</span>
              <span className="font-semibold">{metadata.tokens_involved?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Transaction Details
          </h5>
          <div className="grid gap-2 text-sm">
            {metadata.payment_method && (
              <div className="flex justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Payment Method:</span>
                <Badge variant="secondary">{metadata.payment_method}</Badge>
              </div>
            )}
            {metadata.completion_date && (
              <div className="flex justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Completion Date:</span>
                <span className="font-medium">
                  {format(new Date(metadata.completion_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {metadata.agreement_signed && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <FileCheck className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Agreement Signed</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="grid gap-2">
          {metadata.sale_agreement_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={metadata.sale_agreement_url} target="_blank" rel="noopener noreferrer">
                <FileCheck className="h-4 w-4 mr-2" />
                View Sale Agreement
              </a>
            </Button>
          )}
          {metadata.title_transfer_doc_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={metadata.title_transfer_doc_url} target="_blank" rel="noopener noreferrer">
                <FileCheck className="h-4 w-4 mr-2" />
                View Title Transfer
              </a>
            </Button>
          )}
        </div>

        {/* Blockchain Record */}
        {metadata.hcs_transaction_id && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p className="font-mono truncate">
              Blockchain: {metadata.hcs_transaction_id}
            </p>
          </div>
        )}
      </div>
    </EventAccordion>
  );
};
