import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  ArrowLeft
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
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
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
                  <p className="text-muted-foreground">No activities recorded yet</p>
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
                                  {format(new Date(activity.event_date), "MMM d, yyyy")}
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
  const config = EVENT_CONFIG[activity.event_type as EventType] || EVENT_CONFIG.inspection;
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
              variant={activity.event_status === "completed" ? "default" : "secondary"}
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
                <p className="text-sm text-muted-foreground mb-1">Conducted By</p>
                <p className="text-sm font-medium">{activity.conducted_by_name}</p>
              </div>
              {activity.conducted_by_company && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="text-sm font-medium">{activity.conducted_by_company}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Amount (NGN)</p>
                  <p className="text-lg font-bold">
                    ₦{activity.amount_ngn.toLocaleString()}
                  </p>
                </div>
              )}
              {activity.amount_usd && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount (USD)</p>
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
                  <p className="text-sm text-muted-foreground mb-1">HCS Transaction ID</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Sequence Number</p>
                  <p className="text-sm font-mono">{activity.hcs_sequence_number}</p>
                </div>
              )}
              {activity.hcs_topic_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">HCS Topic ID</p>
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

      {/* Event Details */}
      {activity.event_details && Object.keys(activity.event_details).length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Additional Details
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(activity.event_details, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
