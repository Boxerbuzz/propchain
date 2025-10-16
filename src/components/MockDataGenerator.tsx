import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MockDataGeneratorProps {
  propertyId: string;
}

export const MockDataGenerator = ({ propertyId }: MockDataGeneratorProps) => {
  const [eventType, setEventType] = useState<string>("rental");
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
      const { data, error } = await supabase.functions.invoke("generate-mock-property-event", {
        body: {
          property_id: propertyId,
          event_type: eventType,
          auto_mode: false,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Mock ${data.data.event_type} event generated successfully! 🎉`);
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
