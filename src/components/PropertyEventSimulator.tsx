import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Home, DollarSign, Wrench, Check, ChevronsUpDown, Sparkles, Loader2, AlertTriangle, Bot, Hand, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProperties } from "@/hooks/usePropertyManagement";
import { InspectionForm } from "./event-forms/InspectionForm";
import { RentalForm } from "./event-forms/RentalForm";
import { PurchaseForm } from "./event-forms/PurchaseForm";
import { MaintenanceForm } from "./event-forms/MaintenanceForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockDataPrefill } from "@/hooks/useMockDataPrefill";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PropertyEventSimulator = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [eventType, setEventType] = useState<string>("rental");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: properties = [], isLoading } = useUserProperties();
  const { generateMockRental, generateMockPurchase, generateMockInspection, generateMockMaintenance } = useMockDataPrefill();

  const selectedProp = properties.find((p) => p.id === selectedProperty);

  const handleAutoGenerate = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property first");
      return;
    }

    setIsGenerating(true);
    
    try {
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

      const { data, error } = await supabase.functions.invoke("record-property-event", {
        body: {
          property_id: selectedProperty,
          event_type: eventType,
          event_data: eventData,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to generate event");
      
      toast.success(`Mock ${eventType} event recorded successfully! 🎉`);
    } catch (error: any) {
      toast.error(`Failed to generate event: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Event Simulator</CardTitle>
          <CardDescription>
            Record property inspections, rentals, and purchase transactions on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Property</label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedProperty ? (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          <span>{selectedProp?.title}</span>
                          {selectedProp?.hcs_topic_id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              HCS Enabled
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "Choose a property to record events"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search properties..." />
                      <CommandList>
                        <CommandEmpty>No property found.</CommandEmpty>
                        <CommandGroup>
                          {properties.map((property) => (
                            <CommandItem
                              key={property.id}
                              value={property.title}
                              onSelect={() => {
                                setSelectedProperty(property.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProperty === property.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Home className="w-4 h-4 mr-2" />
                              <span>{property.title}</span>
                              {property.hcs_topic_id && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  HCS Enabled
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {selectedProp && !selectedProp.hcs_topic_id && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-800 dark:text-yellow-200 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This property does not have an HCS topic ID. Events will be recorded in the database but not on the blockchain.
                  </p>
                </div>
              </div>
            )}

            {selectedProperty && (
              <>
                {/* Auto/Manual Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {autoMode ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <Hand className="w-4 h-4" />
                      )}
                      <Label htmlFor="auto-mode" className="text-sm font-medium cursor-pointer">
                        {autoMode ? "Auto Mode" : "Manual Mode"}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {autoMode ? "Generate and record events automatically" : "Fill forms manually or with mock data"}
                    </p>
                  </div>
                  <Switch
                    id="auto-mode"
                    checked={autoMode}
                    onCheckedChange={setAutoMode}
                  />
                </div>

                {/* Auto Mode UI */}
                {autoMode && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-type">Event Type</Label>
                        <Select value={eventType} onValueChange={setEventType}>
                          <SelectTrigger id="event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rental">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Rental Payment</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="purchase">
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                <span>Property Purchase</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="inspection">
                              <div className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                <span>Property Inspection</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="maintenance">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                <span>Maintenance Work</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                        className="w-full"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating & Recording...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate & Record Event
                          </>
                        )}
                      </Button>

                      <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                        <p className="font-medium">What happens:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Realistic mock data is generated</li>
                          <li>Event is recorded to database</li>
                          <li>Event is submitted to HCS blockchain</li>
                          <li>Treasury transactions created (if applicable)</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Mode UI */}
                {!autoMode && (
                  <Tabs defaultValue="inspection">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="inspection" className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        Inspection
                      </TabsTrigger>
                      <TabsTrigger value="rental" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Rental
                      </TabsTrigger>
                      <TabsTrigger value="purchase" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Purchase
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Maintenance
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inspection" className="mt-6">
                      <InspectionForm propertyId={selectedProperty} propertyTitle={selectedProp?.title || ""} />
                    </TabsContent>

                    <TabsContent value="rental" className="mt-6">
                      <RentalForm propertyId={selectedProperty} propertyTitle={selectedProp?.title || ""} />
                    </TabsContent>

                    <TabsContent value="purchase" className="mt-6">
                      <PurchaseForm propertyId={selectedProperty} propertyTitle={selectedProp?.title || ""} />
                    </TabsContent>

                    <TabsContent value="maintenance" className="mt-6">
                      <MaintenanceForm propertyId={selectedProperty} propertyTitle={selectedProp?.title || ""} />
                    </TabsContent>
                  </Tabs>
                )}
              </>
            )}

            {!selectedProperty && (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a property above to start recording events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
