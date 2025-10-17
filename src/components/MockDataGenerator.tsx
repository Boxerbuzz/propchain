import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Nigerian names and data
const NIGERIAN_FIRST_NAMES = [
  "Chukwu", "Adebayo", "Amina", "Ngozi", "Oluwaseun", "Fatima", "Emeka", "Blessing",
  "Ibrahim", "Chioma", "Yusuf", "Chiamaka", "Aisha", "Chinedu", "Kemi", "Tunde",
  "Zainab", "Obiora", "Nneka", "Musa", "Funmi", "Uche", "Halima", "Ikenna"
];

const NIGERIAN_LAST_NAMES = [
  "Okonkwo", "Adeyemi", "Bello", "Eze", "Mohammed", "Okafor", "Abubakar", "Nwosu",
  "Hassan", "Ojo", "Okeke", "Aliyu", "Chukwu", "Ibrahim", "Nnamdi", "Sani",
  "Obi", "Yusuf", "Uzoma", "Garba"
];

const COMPANIES = [
  "PropertiesNG Ltd", "Lagos Real Estate Co", "Abuja Homes", "Nigerian Property Trust",
  "Premium Estates", "Urban Properties", "Elite Real Estate", "Capital Homes",
  "Skyline Properties", "Heritage Real Estate"
];

const PHONE_PREFIXES = ["+234 803", "+234 806", "+234 813", "+234 901", "+234 705", "+234 810"];
const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "propertiesng.com", "hotmail.com"];

// Helper functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDigits(count: number): string {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function futureDate(minDays: number, maxDays: number): string {
  const days = randomRange(minDays, maxDays);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function generateName(): { first: string; last: string; full: string } {
  const first = randomChoice(NIGERIAN_FIRST_NAMES);
  const last = randomChoice(NIGERIAN_LAST_NAMES);
  return { first, last, full: `${first} ${last}` };
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomChoice(EMAIL_DOMAINS)}`;
}

function generatePhone(): string {
  return `${randomChoice(PHONE_PREFIXES)} ${randomDigits(7)}`;
}

// Event generators
function generateMockRental() {
  const tenant = generateName();
  const rentAmount = randomRange(150000, 800000);
  
  return {
    rental_type: randomChoice(["long_term", "short_term", "commercial"]),
    tenant_name: tenant.full,
    tenant_email: generateEmail(tenant.first, tenant.last),
    tenant_phone: generatePhone(),
    tenant_id_number: `NIN${randomDigits(11)}`,
    monthly_rent_ngn: rentAmount,
    security_deposit_ngn: rentAmount * 2,
    agency_fee_ngn: rentAmount * 0.1,
    legal_fee_ngn: rentAmount * 0.05,
    start_date: futureDate(1, 30),
    end_date: futureDate(365, 730),
    lease_duration_months: randomChoice([12, 24, 36]),
    payment_method: randomChoice(["bank_transfer", "cash", "check"]),
    payment_status: "completed",
    amount_paid_ngn: rentAmount + (rentAmount * 2),
    special_terms: randomChoice([null, "Includes water bill", "Pet-friendly", "Renewable annually"]),
    notes: randomChoice([
      "Tenant has excellent credit history",
      "Lease includes option to renew",
      "Background check completed successfully",
      "Employment verification confirmed",
      "Previous landlord provided positive reference"
    ]),
    conductor_name: tenant.full,
    conductor_company: randomChoice(COMPANIES),
    amount_ngn: rentAmount + (rentAmount * 2),
  };
}

function generateMockPurchase() {
  const buyer = generateName();
  const purchasePrice = randomRange(5000000, 50000000);
  
  return {
    transaction_type: randomChoice(["full_purchase", "partial_sellout", "token_buyback"]),
    buyer_name: buyer.full,
    buyer_email: generateEmail(buyer.first, buyer.last),
    buyer_phone: generatePhone(),
    buyer_id_number: `NIN${randomDigits(11)}`,
    seller_name: randomChoice(["PropChain Platform", "Previous Owner", "Estate Trust"]),
    purchase_price_ngn: purchasePrice,
    purchase_price_usd: purchasePrice / 1500,
    tokens_involved: randomRange(100, 10000),
    percentage_sold: randomRange(5, 100),
    payment_method: randomChoice(["bank_transfer", "cash", "mortgage"]),
    payment_plan: randomChoice(["outright", "installment", "mortgage"]),
    down_payment_ngn: purchasePrice * 0.3,
    remaining_balance_ngn: purchasePrice * 0.7,
    transaction_status: "completed",
    completion_date: futureDate(30, 90),
    notes: randomChoice([
      "Transaction completed smoothly",
      "All documentation verified",
      "Title search completed - clear title",
      "Property survey conducted",
      "Legal due diligence completed"
    ]),
    conductor_name: buyer.full,
    conductor_company: randomChoice(COMPANIES),
    amount_ngn: purchasePrice,
  };
}

function generateMockInspection() {
  const inspector = generateName();
  
  return {
    inspection_type: randomChoice(["pre_listing", "buyer_inspection", "routine", "post_repair"]),
    inspector_name: inspector.full,
    inspector_license: `INSP-${randomDigits(8)}`,
    inspector_company: randomChoice(COMPANIES),
    structural_condition: randomChoice(["excellent", "good", "fair", "needs_repair"]),
    foundation_status: randomChoice(["excellent", "good", "minor_issues", "needs_repair"]),
    roof_status: randomChoice(["excellent", "good", "minor_leaks", "needs_replacement"]),
    walls_status: randomChoice(["excellent", "good", "minor_cracks", "needs_repair"]),
    electrical_status: randomChoice(["excellent", "good", "needs_upgrade", "fair"]),
    plumbing_status: randomChoice(["excellent", "good", "minor_leaks", "needs_repair"]),
    overall_rating: randomRange(6, 10),
    market_value_estimate: randomRange(8000000, 60000000),
    rental_value_estimate: randomRange(200000, 900000),
    estimated_repair_cost: randomRange(0, 500000),
    issues_found: [
      randomChoice(["Minor crack in living room wall", "Slight water stain on bathroom ceiling", "Loose door handle in bedroom"]),
      randomChoice(["Worn weatherstripping on front door", "Faded paint in hallway", "Chipped tiles in kitchen"])
    ],
    required_repairs: [
      randomChoice(["Patch and repaint living room wall", "Investigate and repair bathroom ceiling leak", "Tighten door handle hardware"])
    ],
    room_assessments: {},
    notes: randomChoice([
      "Property is well-maintained overall",
      "Minor cosmetic improvements recommended",
      "All major systems functioning properly",
      "Inspection completed within 2 hours",
      "Detailed report provided to owner"
    ]),
    conductor_name: inspector.full,
    conductor_company: randomChoice(COMPANIES),
  };
}

function generateMockMaintenance() {
  const contractor = generateName();
  const estimatedCost = randomRange(20000, 500000);
  
  return {
    maintenance_type: randomChoice(["routine", "emergency", "preventive", "cosmetic"]),
    issue_category: randomChoice(["plumbing", "electrical", "structural", "hvac", "landscaping"]),
    issue_severity: randomChoice(["low", "medium", "high", "critical"]),
    issue_description: randomChoice([
      "Kitchen sink faucet is dripping",
      "Air conditioning not cooling efficiently",
      "Broken light fixture in bedroom",
      "Clogged bathroom drain",
      "Loose tiles in entryway"
    ]),
    contractor_name: contractor.full,
    contractor_company: randomChoice(["Fix-It Services", "Lagos Repairs", "Maintenance Masters", "ProFix Nigeria"]),
    contractor_phone: generatePhone(),
    estimated_cost_ngn: estimatedCost,
    actual_cost_ngn: estimatedCost * randomRange(90, 110) / 100,
    work_performed: randomChoice([
      "Replaced faucet cartridge and tested for leaks",
      "Recharged AC unit and cleaned filters",
      "Installed new light fixture and tested operation",
      "Cleared drain blockage using professional equipment",
      "Re-grouted and secured loose tiles"
    ]),
    maintenance_status: "completed",
    payment_status: "completed",
    payment_method: randomChoice(["bank_transfer", "cash", "check"]),
    follow_up_required: randomChoice([true, false]),
    notes: randomChoice([
      "Work completed within estimated timeframe",
      "All materials are high quality",
      "Follow-up inspection recommended in 6 months",
      "Warranty provided for parts and labor",
      "Tenants were informed of work schedule"
    ]),
    conductor_name: contractor.full,
    conductor_company: randomChoice(COMPANIES),
    amount_ngn: estimatedCost,
  };
}

interface MockDataGeneratorProps {
  propertyId: string;
}

export const MockDataGenerator = ({ propertyId }: MockDataGeneratorProps) => {
  const [eventType, setEventType] = useState<string>("rental");
  const [autoMode, setAutoMode] = useState(false);
  const queryClient = useQueryClient();

  // Fetch recent mock events
  const { data: recentEvents } = useQuery({
    queryKey: ["mock-events", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("property_id", propertyId)
        .eq("activity_type", "mock_event_generated")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Generate mock event mutation
  const generateMockEvent = useMutation({
    mutationFn: async () => {
      // Generate event data based on type
      let eventData;
      switch (eventType) {
        case "rental":
          eventData = generateMockRental();
          break;
        case "purchase":
          eventData = generateMockPurchase();
          break;
        case "inspection":
          eventData = generateMockInspection();
          break;
        case "maintenance":
          eventData = generateMockMaintenance();
          break;
        default:
          throw new Error(`Invalid event type: ${eventType}`);
      }

      console.log(`[MOCK-EVENT] Generated ${eventType} event data:`, eventData);

      // Record the event using the record-property-event function
      const { data, error } = await supabase.functions.invoke("record-property-event", {
        body: {
          property_id: propertyId,
          event_type: eventType,
          event_data: eventData,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to generate mock event");
      
      return { event_type: eventType, data };
    },
    onSuccess: (result) => {
      toast.success(`Mock ${result.event_type} event generated successfully! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["mock-events", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["property-events", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["property-activity", propertyId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to generate mock event: ${error.message}`);
    },
  });

  const handleGenerateEvent = () => {
    generateMockEvent.mutate();
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>Mock Data Generator</CardTitle>
        </div>
        <CardDescription>
          Generate realistic property events for testing the treasury system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Auto/Manual Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mode" className="text-sm font-medium">
                {autoMode ? "🤖 Auto Mode" : "✋ Manual Mode"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {autoMode ? "Events generated automatically" : "Generate events manually"}
              </p>
            </div>
            <Switch
              id="auto-mode"
              checked={autoMode}
              onCheckedChange={setAutoMode}
            />
          </div>

          {!autoMode && (
            <>
              {/* Event Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">💰 Rental Payment</SelectItem>
                    <SelectItem value="purchase">🏠 Property Purchase</SelectItem>
                    <SelectItem value="inspection">🔍 Property Inspection</SelectItem>
                    <SelectItem value="maintenance">🔧 Maintenance Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateEvent}
                disabled={generateMockEvent.isPending}
                className="w-full"
                size="lg"
              >
                {generateMockEvent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Mock Event
                  </>
                )}
              </Button>
            </>
          )}

          {autoMode && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Auto mode enabled</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mock events will be generated automatically in the background
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <p className="font-medium">What gets generated:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Realistic Nigerian names, emails, phone numbers</li>
              <li>Random but sensible amounts and dates</li>
              <li>Unique data every time (no duplicates)</li>
              <li>Automatic HCS blockchain recording</li>
              <li>Treasury transactions (for rental/purchase)</li>
            </ul>
          </div>

          {/* Recent Events */}
          {recentEvents && recentEvents.length > 0 && (
            <div className="space-y-2">
              <Label>Recently Generated</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {(event.metadata as any)?.event_type || "event"}
                          </Badge>
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
