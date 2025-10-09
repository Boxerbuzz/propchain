import { Home, Calendar, DollarSign, User, FileText } from "lucide-react";
import { EventAccordion } from "./EventAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";

interface RentalEventMessageProps {
  metadata: any;
  createdAt: string;
}

export const RentalEventMessage = ({ metadata, createdAt }: RentalEventMessageProps) => {
  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  const totalAmount = (metadata.monthly_rent_ngn || 0) + 
                      (metadata.security_deposit_ngn || 0) + 
                      (metadata.agency_fee_ngn || 0) + 
                      (metadata.legal_fee_ngn || 0);

  return (
    <EventAccordion
      icon={Home}
      title="Property Rental Agreement"
      subtitle={`Tenant: ${metadata.tenant_name} • ${formatDistanceToNow(new Date(createdAt), { addSuffix: true })}`}
      badge={{
        label: metadata.payment_status || "Pending",
        variant: getPaymentStatusBadge(metadata.payment_status),
      }}
    >
      <div className="space-y-4">
        {/* Tenant Information */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Tenant Information
          </h5>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{metadata.tenant_name}</span>
            </div>
            {metadata.tenant_email && (
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-xs">{metadata.tenant_email}</span>
              </div>
            )}
            {metadata.tenant_phone && (
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{metadata.tenant_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rental Period */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rental Period
          </h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="font-semibold">{format(new Date(metadata.start_date), "MMM d, yyyy")}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="font-semibold">{format(new Date(metadata.end_date), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="text-center p-2 bg-primary/10 rounded-lg">
            <span className="font-semibold">{metadata.lease_duration_months} months lease</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Breakdown
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-background rounded">
              <span className="text-muted-foreground">Monthly Rent:</span>
              <span className="font-semibold">₦{metadata.monthly_rent_ngn?.toLocaleString()}</span>
            </div>
            {metadata.security_deposit_ngn > 0 && (
              <div className="flex justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Security Deposit:</span>
                <span className="font-semibold">₦{metadata.security_deposit_ngn?.toLocaleString()}</span>
              </div>
            )}
            {metadata.agency_fee_ngn > 0 && (
              <div className="flex justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Agency Fee:</span>
                <span className="font-semibold">₦{metadata.agency_fee_ngn?.toLocaleString()}</span>
              </div>
            )}
            {metadata.legal_fee_ngn > 0 && (
              <div className="flex justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Legal Fee:</span>
                <span className="font-semibold">₦{metadata.legal_fee_ngn?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-primary/10 rounded-lg font-bold">
              <span>Total Initial Payment:</span>
              <span>₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Utilities & Terms */}
        {metadata.utilities_included && metadata.utilities_included.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Utilities Included</h5>
            <div className="flex flex-wrap gap-2">
              {metadata.utilities_included.map((utility: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {utility}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {metadata.special_terms && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Special Terms</h5>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {metadata.special_terms}
            </p>
          </div>
        )}

        {/* Lease Agreement */}
        {metadata.lease_agreement_url && (
          <Button variant="outline" className="w-full" asChild>
            <a href={metadata.lease_agreement_url} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              View Lease Agreement
            </a>
          </Button>
        )}

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
