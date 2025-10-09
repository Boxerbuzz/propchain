import { Search, AlertTriangle, CheckCircle, DollarSign, Camera } from "lucide-react";
import { EventAccordion } from "./EventAccordion";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface InspectionEventMessageProps {
  metadata: any;
  createdAt: string;
}

export const InspectionEventMessage = ({ metadata, createdAt }: InspectionEventMessageProps) => {
  const getConditionBadge = (condition: string) => {
    const variants: Record<string, any> = {
      excellent: { variant: "default", color: "text-green-600" },
      good: { variant: "secondary", color: "text-blue-600" },
      fair: { variant: "outline", color: "text-yellow-600" },
      poor: { variant: "destructive", color: "text-red-600" },
    };
    return variants[condition?.toLowerCase()] || variants.fair;
  };

  const overallRating = metadata.overall_rating || 0;
  const conditionStyle = getConditionBadge(metadata.structural_condition);

  return (
    <EventAccordion
      icon={Search}
      title={`Property Inspection - ${metadata.inspection_type || "General"}`}
      subtitle={`Conducted by ${metadata.inspector_name || "Unknown"} • ${formatDistanceToNow(new Date(createdAt), { addSuffix: true })}`}
      badge={{
        label: metadata.structural_condition || "N/A",
        variant: conditionStyle.variant,
      }}
    >
      <div className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">Overall Rating</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded-sm ${
                    i < overallRating ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{overallRating}/10</span>
          </div>
        </div>

        {/* Structural Assessment */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm">Structural Assessment</h5>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Foundation", value: metadata.foundation_status },
              { label: "Roof", value: metadata.roof_status },
              { label: "Walls", value: metadata.walls_status },
              { label: "Electrical", value: metadata.electrical_status },
              { label: "Plumbing", value: metadata.plumbing_status },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                <span className="text-muted-foreground">{item.label}:</span>
                <Badge variant={getConditionBadge(item.value).variant} className="text-xs">
                  {item.value || "N/A"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Issues Found */}
        {metadata.issues_found && metadata.issues_found.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Issues Found ({metadata.issues_found.length})
            </h5>
            <ul className="space-y-1 text-sm">
              {metadata.issues_found.slice(0, 5).map((issue: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Repairs */}
        {metadata.required_repairs && metadata.required_repairs.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Required Repairs
            </h5>
            <ul className="space-y-1 text-sm">
              {metadata.required_repairs.slice(0, 5).map((repair: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{repair}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cost Estimates */}
        <div className="grid grid-cols-2 gap-3">
          {metadata.estimated_repair_cost && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Repair Cost</p>
                <p className="font-semibold">₦{metadata.estimated_repair_cost.toLocaleString()}</p>
              </div>
            </div>
          )}
          {metadata.market_value_estimate && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Market Value</p>
                <p className="font-semibold">₦{metadata.market_value_estimate.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Inspector Info */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
          {metadata.inspector_company && <p>Company: {metadata.inspector_company}</p>}
          {metadata.inspector_license && <p>License: {metadata.inspector_license}</p>}
          {metadata.hcs_transaction_id && (
            <p className="font-mono text-xs truncate">
              Blockchain: {metadata.hcs_transaction_id}
            </p>
          )}
        </div>
      </div>
    </EventAccordion>
  );
};
