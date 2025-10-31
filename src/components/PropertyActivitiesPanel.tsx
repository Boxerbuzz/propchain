import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardCheck,
  Home,
  DollarSign,
  Wrench,
  ExternalLink,
  Calendar,
  User,
  Building2,
  FileText,
  ArrowLeft,
  Receipt,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Star,
  Zap,
  Droplet,
  Hammer,
  Link as LinkIcon,
} from "lucide-react";
import { usePropertyEvents } from "@/hooks/usePropertyEvents";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PropertyActivitiesPanelProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

type EventType = "inspection" | "rental" | "purchase" | "maintenance";

const EVENT_CONFIG = {
  inspection: {
    icon: ClipboardCheck,
    label: "Inspection",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  rental: {
    icon: Home,
    label: "Rental",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  purchase: {
    icon: DollarSign,
    label: "Purchase",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
};

export function PropertyActivitiesPanel({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
}: PropertyActivitiesPanelProps) {
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const { data: activities = [], isLoading } = usePropertyEvents(propertyId);

  const getEventConfig = (eventType: string) => {
    return EVENT_CONFIG[eventType as EventType] || EVENT_CONFIG.inspection;
  };

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col"
        aria-labelledby="property-activities-panel-title"
        aria-describedby="property-activities-panel-description"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            {selectedActivity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="truncate">
                {selectedActivity ? "Activity Details" : "Property Activities"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {propertyTitle}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : selectedActivity ? (
            <ActivityDetails activity={selectedActivity} />
          ) : (
            <div className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No activities recorded yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const config = getEventConfig(activity.event_type);
                    const Icon = config.icon;

                    return (
                      <Card
                        key={activity.id}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleViewDetails(activity)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", config.bgColor)}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              <Badge
                                variant={
                                  activity.event_status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {activity.event_status}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm line-clamp-2">
                              {activity.summary}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(activity.event_date),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                              {activity.hcs_transaction_id && (
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <span>On-chain</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ActivityDetails({ activity }: { activity: any }) {
  const config =
    EVENT_CONFIG[activity.event_type as EventType] || EVENT_CONFIG.inspection;
  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg", config.bgColor)}>
          <Icon className={cn("h-6 w-6", config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{config.label}</Badge>
            <Badge
              variant={
                activity.event_status === "completed" ? "default" : "secondary"
              }
            >
              {activity.event_status}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{activity.summary}</h3>
        </div>
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase">
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Event Date</p>
            <p className="text-sm font-medium">
              {format(new Date(activity.event_date), "PPP")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Recorded At</p>
            <p className="text-sm font-medium">
              {format(new Date(activity.created_at), "PPP")}
            </p>
          </div>
          {activity.conducted_by_name && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Conducted By
                </p>
                <p className="text-sm font-medium">
                  {activity.conducted_by_name}
                </p>
              </div>
              {activity.conducted_by_company && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="text-sm font-medium">
                    {activity.conducted_by_company}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Amounts */}
      {(activity.amount_ngn || activity.amount_usd) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Financial Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {activity.amount_ngn && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount (NGN)
                  </p>
                  <p className="text-lg font-bold">
                    ₦{activity.amount_ngn.toLocaleString()}
                  </p>
                </div>
              )}
              {activity.amount_usd && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount (USD)
                  </p>
                  <p className="text-lg font-bold">
                    ${activity.amount_usd.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* HCS Records */}
      {activity.hcs_transaction_id && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Blockchain Records
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">
                    HCS Transaction ID
                  </p>
                  <p className="text-sm font-mono break-all">
                    {activity.hcs_transaction_id}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1"
                    onClick={() =>
                      window.open(
                        `https://hashscan.io/testnet/transaction/${activity.hcs_transaction_id}`,
                        "_blank"
                      )
                    }
                  >
                    View on HashScan
                  </Button>
                </div>
              </div>
              {activity.hcs_sequence_number && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Sequence Number
                  </p>
                  <p className="text-sm font-mono">
                    {activity.hcs_sequence_number}
                  </p>
                </div>
              )}
              {activity.hcs_topic_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    HCS Topic ID
                  </p>
                  <p className="text-sm font-mono">{activity.hcs_topic_id}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {activity.notes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Notes
            </h4>
            <p className="text-sm leading-relaxed">{activity.notes}</p>
          </div>
        </>
      )}

      {/* Event-Specific Details */}
      {activity.event_details &&
        Object.keys(activity.event_details).length > 0 && (
          <>
            <Separator />
            {activity.event_type === "inspection" && (
              <InspectionDetails details={activity.event_details} />
            )}
            {activity.event_type === "rental" && (
              <RentalDetails details={activity.event_details} />
            )}
            {activity.event_type === "purchase" && (
              <PurchaseDetails details={activity.event_details} />
            )}
            {activity.event_type === "maintenance" && (
              <MaintenanceDetails details={activity.event_details} />
            )}
          </>
        )}
    </div>
  );
}

// Event-specific detail components
function InspectionDetails({ details }: { details: any }) {
  const getConditionBadge = (condition: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; color: string }
    > = {
      excellent: { variant: "default", color: "text-green-600" },
      good: { variant: "default", color: "text-green-600" },
      fair: { variant: "secondary", color: "text-yellow-600" },
      poor: { variant: "destructive", color: "text-red-600" },
      critical: { variant: "destructive", color: "text-red-600" },
    };
    return variants[condition?.toLowerCase()] || variants.good;
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase">
        Inspection Details
      </h4>

      {/* Inspection Type */}
      {details.inspection_type && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Inspection Type</p>
          <Badge variant="outline">{details.inspection_type}</Badge>
        </div>
      )}

      {/* Overall Rating */}
      {details.overall_rating && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Rating</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < details.overall_rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              ))}
              <span className="ml-2 font-bold">{details.overall_rating}/5</span>
            </div>
          </div>
        </Card>
      )}

      {/* Structural Assessment */}
      {(details.foundation_status ||
        details.roof_status ||
        details.walls_status ||
        details.electrical_status ||
        details.plumbing_status) && (
        <div>
          <p className="text-sm font-medium mb-3">Structural Assessment</p>
          <div className="grid grid-cols-2 gap-3">
            {details.foundation_status && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Foundation</span>
                </div>
                <Badge
                  variant={getConditionBadge(details.foundation_status).variant}
                  className={getConditionBadge(details.foundation_status).color}
                >
                  {details.foundation_status}
                </Badge>
              </Card>
            )}
            {details.roof_status && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Roof</span>
                </div>
                <Badge
                  variant={getConditionBadge(details.roof_status).variant}
                  className={getConditionBadge(details.roof_status).color}
                >
                  {details.roof_status}
                </Badge>
              </Card>
            )}
            {details.walls_status && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Walls</span>
                </div>
                <Badge
                  variant={getConditionBadge(details.walls_status).variant}
                  className={getConditionBadge(details.walls_status).color}
                >
                  {details.walls_status}
                </Badge>
              </Card>
            )}
            {details.electrical_status && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Electrical</span>
                </div>
                <Badge
                  variant={getConditionBadge(details.electrical_status).variant}
                  className={getConditionBadge(details.electrical_status).color}
                >
                  {details.electrical_status}
                </Badge>
              </Card>
            )}
            {details.plumbing_status && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Plumbing</span>
                </div>
                <Badge
                  variant={getConditionBadge(details.plumbing_status).variant}
                  className={getConditionBadge(details.plumbing_status).color}
                >
                  {details.plumbing_status}
                </Badge>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Issues Found */}
      {details.issues_found &&
        Array.isArray(details.issues_found) &&
        details.issues_found.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Issues Found</p>
            <ul className="space-y-2">
              {details.issues_found
                .slice(0, 5)
                .map((issue: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* Required Repairs */}
      {details.required_repairs &&
        Array.isArray(details.required_repairs) &&
        details.required_repairs.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Required Repairs</p>
            <ul className="space-y-2">
              {details.required_repairs
                .slice(0, 5)
                .map((repair: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Hammer className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{repair}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* Cost Estimates */}
      {(details.estimated_repair_cost || details.market_value_estimate) && (
        <div className="grid grid-cols-2 gap-4">
          {details.estimated_repair_cost && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Estimated Repair Cost
              </p>
              <p className="text-lg font-bold">
                ₦{details.estimated_repair_cost.toLocaleString()}
              </p>
            </Card>
          )}
          {details.market_value_estimate && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Market Value</p>
              <p className="text-lg font-bold">
                ₦{details.market_value_estimate.toLocaleString()}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Inspector Info */}
      {(details.inspector_company || details.inspector_license) && (
        <Card className="p-4 space-y-2">
          {details.inspector_company && (
            <div>
              <p className="text-xs text-muted-foreground">Inspector Company</p>
              <p className="text-sm font-medium">{details.inspector_company}</p>
            </div>
          )}
          {details.inspector_license && (
            <div>
              <p className="text-xs text-muted-foreground">License Number</p>
              <p className="text-sm font-mono">{details.inspector_license}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function RentalDetails({ details }: { details: any }) {
  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase">
        Rental Agreement Details
      </h4>

      {/* Tenant Information */}
      {(details.tenant_name ||
        details.tenant_email ||
        details.tenant_phone) && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">Tenant Information</p>
          {details.tenant_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.tenant_name}</span>
            </div>
          )}
          {details.tenant_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.tenant_email}</span>
            </div>
          )}
          {details.tenant_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.tenant_phone}</span>
            </div>
          )}
          {details.tenant_id_number && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID: {details.tenant_id_number}</span>
            </div>
          )}
        </Card>
      )}

      {/* Rental Period */}
      {(details.start_date ||
        details.end_date ||
        details.lease_duration_months) && (
        <div>
          <p className="text-sm font-medium mb-3">Rental Period</p>
          <div className="grid grid-cols-2 gap-4">
            {details.start_date && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm">
                  {format(new Date(details.start_date), "PPP")}
                </p>
              </div>
            )}
            {details.end_date && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <p className="text-sm">
                  {format(new Date(details.end_date), "PPP")}
                </p>
              </div>
            )}
            {details.lease_duration_months && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-sm">
                  {details.lease_duration_months} months
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Breakdown */}
      {(details.monthly_rent_ngn ||
        details.security_deposit_ngn ||
        details.agency_fee_ngn ||
        details.legal_fee_ngn) && (
        <div>
          <p className="text-sm font-medium mb-3">Payment Breakdown</p>
          <div className="space-y-2">
            {details.monthly_rent_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Monthly Rent</span>
                <span className="font-bold">
                  ₦{details.monthly_rent_ngn.toLocaleString()}
                </span>
              </div>
            )}
            {details.security_deposit_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Security Deposit</span>
                <span className="font-medium">
                  ₦{details.security_deposit_ngn.toLocaleString()}
                </span>
              </div>
            )}
            {details.agency_fee_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Agency Fee</span>
                <span className="font-medium">
                  ₦{details.agency_fee_ngn.toLocaleString()}
                </span>
              </div>
            )}
            {details.legal_fee_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Legal Fee</span>
                <span className="font-medium">
                  ₦{details.legal_fee_ngn.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Status */}
      {details.payment_status && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Status</span>
            <Badge variant={getPaymentStatusBadge(details.payment_status)}>
              {details.payment_status}
            </Badge>
          </div>
          {details.amount_paid_ngn && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="text-sm font-medium">
                ₦{details.amount_paid_ngn.toLocaleString()}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Utilities */}
      {details.utilities_included &&
        Array.isArray(details.utilities_included) &&
        details.utilities_included.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Utilities Included</p>
            <div className="flex flex-wrap gap-2">
              {details.utilities_included.map(
                (utility: string, index: number) => (
                  <Badge key={index} variant="outline">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {utility}
                  </Badge>
                )
              )}
            </div>
          </div>
        )}

      {/* Special Terms */}
      {details.special_terms && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Special Terms</p>
          <p className="text-sm text-muted-foreground">
            {details.special_terms}
          </p>
        </Card>
      )}

      {/* Lease Agreement */}
      {details.lease_agreement_url && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(details.lease_agreement_url, "_blank")}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          View Lease Agreement
        </Button>
      )}
    </div>
  );
}

function PurchaseDetails({ details }: { details: any }) {
  const getTransactionStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return variants[status?.toLowerCase()] || "secondary";
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase">
        Purchase Transaction Details
      </h4>

      {/* Transaction Type & Status */}
      <div className="flex items-center gap-2">
        {details.transaction_type && (
          <Badge variant="outline">{details.transaction_type}</Badge>
        )}
        {details.transaction_status && (
          <Badge
            variant={getTransactionStatusBadge(details.transaction_status)}
          >
            {details.transaction_status}
          </Badge>
        )}
      </div>

      {/* Buyer Information */}
      {(details.buyer_name || details.buyer_email || details.buyer_phone) && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">Buyer Information</p>
          {details.buyer_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.buyer_name}</span>
            </div>
          )}
          {details.buyer_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.buyer_email}</span>
            </div>
          )}
          {details.buyer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.buyer_phone}</span>
            </div>
          )}
          {details.buyer_id_number && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID: {details.buyer_id_number}</span>
            </div>
          )}
        </Card>
      )}

      {/* Seller Information */}
      {details.seller_name && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Seller Information</p>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{details.seller_name}</span>
          </div>
        </Card>
      )}

      {/* Purchase Price */}
      {(details.purchase_price_ngn || details.purchase_price_usd) && (
        <div className="grid grid-cols-2 gap-4">
          {details.purchase_price_ngn && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Purchase Price (NGN)
              </p>
              <p className="text-xl font-bold">
                ₦{details.purchase_price_ngn.toLocaleString()}
              </p>
            </Card>
          )}
          {details.purchase_price_usd && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Purchase Price (USD)
              </p>
              <p className="text-xl font-bold">
                ${details.purchase_price_usd.toLocaleString()}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Payment Plan */}
      {details.payment_plan && details.payment_plan !== "outright" && (
        <div>
          <p className="text-sm font-medium mb-3">Payment Plan</p>
          <div className="space-y-2">
            {details.down_payment_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Down Payment</span>
                <span className="font-bold">
                  ₦{details.down_payment_ngn.toLocaleString()}
                </span>
              </div>
            )}
            {details.remaining_balance_ngn && (
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Remaining Balance</span>
                <span className="font-medium">
                  ₦{details.remaining_balance_ngn.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Information */}
      {(details.tokens_involved || details.percentage_sold) && (
        <Card className="p-4 space-y-2">
          {details.tokens_involved && (
            <div>
              <p className="text-xs text-muted-foreground">Tokens Involved</p>
              <p className="text-sm font-medium">
                {details.tokens_involved.toLocaleString()}
              </p>
            </div>
          )}
          {details.percentage_sold && (
            <div>
              <p className="text-xs text-muted-foreground">Percentage Sold</p>
              <p className="text-sm font-medium">{details.percentage_sold}%</p>
            </div>
          )}
        </Card>
      )}

      {/* Transaction Details */}
      {(details.payment_method || details.completion_date) && (
        <div className="grid grid-cols-2 gap-4">
          {details.payment_method && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Payment Method
              </p>
              <p className="text-sm font-medium">{details.payment_method}</p>
            </div>
          )}
          {details.completion_date && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Completion Date
              </p>
              <p className="text-sm">
                {format(new Date(details.completion_date), "PPP")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      <div className="space-y-2">
        {details.sale_agreement_url && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(details.sale_agreement_url, "_blank")}
          >
            <Receipt className="h-4 w-4 mr-2" />
            View Sale Agreement
          </Button>
        )}
        {details.title_transfer_doc_url && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              window.open(details.title_transfer_doc_url, "_blank")
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            View Title Transfer Document
          </Button>
        )}
      </div>
    </div>
  );
}

function MaintenanceDetails({ details }: { details: any }) {
  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; color: string }
    > = {
      low: { variant: "secondary", color: "text-green-600" },
      medium: { variant: "default", color: "text-yellow-600" },
      high: { variant: "destructive", color: "text-red-600" },
      critical: { variant: "destructive", color: "text-red-600" },
    };
    return variants[severity?.toLowerCase()] || variants.medium;
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase">
        Maintenance Details
      </h4>

      {/* Issue Information */}
      <Card className="p-4 space-y-3">
        {details.issue_severity && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <Badge
              variant={getSeverityBadge(details.issue_severity).variant}
              className={getSeverityBadge(details.issue_severity).color}
            >
              {details.issue_severity}
            </Badge>
          </div>
        )}
        {details.issue_category && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{details.issue_category}</Badge>
          </div>
        )}
        {details.issue_description && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Issue Description
            </p>
            <p className="text-sm">{details.issue_description}</p>
          </div>
        )}
      </Card>

      {/* Contractor Information */}
      {(details.contractor_name || details.contractor_company) && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">Contractor Information</p>
          {details.contractor_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.contractor_name}</span>
            </div>
          )}
          {details.contractor_company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.contractor_company}</span>
            </div>
          )}
          {details.contractor_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{details.contractor_phone}</span>
            </div>
          )}
          {details.contractor_license && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {details.contractor_license}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Cost Information */}
      {(details.estimated_cost_ngn || details.actual_cost_ngn) && (
        <div>
          <p className="text-sm font-medium mb-3">Cost Information</p>
          <div className="grid grid-cols-2 gap-4">
            {details.estimated_cost_ngn && (
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Estimated Cost
                </p>
                <p className="text-lg font-bold">
                  ₦{details.estimated_cost_ngn.toLocaleString()}
                </p>
              </Card>
            )}
            {details.actual_cost_ngn && (
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Actual Cost
                </p>
                <p className="text-lg font-bold">
                  ₦{details.actual_cost_ngn.toLocaleString()}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Work Performed */}
      {details.work_performed && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Work Performed</p>
          <p className="text-sm text-muted-foreground">
            {details.work_performed}
          </p>
        </Card>
      )}

      {/* Parts Replaced */}
      {details.parts_replaced &&
        Array.isArray(details.parts_replaced) &&
        details.parts_replaced.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Parts Replaced</p>
            <ul className="space-y-1">
              {details.parts_replaced.map((part: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{part}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Status & Dates */}
      <div className="grid grid-cols-2 gap-4">
        {details.maintenance_status && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant="outline">{details.maintenance_status}</Badge>
          </div>
        )}
        {details.completion_date && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Completion Date
            </p>
            <p className="text-sm">
              {format(new Date(details.completion_date), "PPP")}
            </p>
          </div>
        )}
        {details.warranty_expiry_date && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Warranty Expires
            </p>
            <p className="text-sm">
              {format(new Date(details.warranty_expiry_date), "PPP")}
            </p>
          </div>
        )}
      </div>

      {/* Warranty Info */}
      {details.warranty_info && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Warranty Information</p>
          <p className="text-sm text-muted-foreground">
            {details.warranty_info}
          </p>
        </Card>
      )}

      {/* Invoice */}
      {details.invoice_url && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(details.invoice_url, "_blank")}
        >
          <Receipt className="h-4 w-4 mr-2" />
          View Invoice
        </Button>
      )}
    </div>
  );
}
