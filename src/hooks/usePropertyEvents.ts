import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PropertyEvent {
  id: string;
  property_id: string;
  event_type: string;
  event_status: string;
  event_date: string;
  summary: string;
  event_details: any;
  hcs_transaction_id: string | null;
  created_at: string;
}

export interface CreateEventData {
  property_id: string;
  event_type: "inspection" | "rental" | "purchase";
  event_data: any;
}

// Hook to fetch all events for a property
export const usePropertyEvents = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-events", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_events" as any)
        .select("*")
        .eq("property_id", propertyId)
        .order("event_date", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PropertyEvent[];
    },
    enabled: !!propertyId,
  });
};

// Hook to fetch property inspections
export const usePropertyInspections = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-inspections", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_inspections" as any)
        .select("*")
        .eq("property_id", propertyId)
        .order("inspection_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!propertyId,
  });
};

// Hook to fetch property rentals
export const usePropertyRentals = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-rentals", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_rentals" as any)
        .select("*")
        .eq("property_id", propertyId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!propertyId,
  });
};

// Hook to fetch property purchases
export const usePropertyPurchases = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-purchases", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_purchases" as any)
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!propertyId,
  });
};

// Hook to create a property event
export const useCreatePropertyEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const { data, error } = await supabase.functions.invoke(
        "record-property-event",
        {
          body: eventData,
        }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to record event");

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["property-events", variables.property_id],
      });
      queryClient.invalidateQueries({
        queryKey: [`property-${variables.event_type}s`, variables.property_id],
      });

      toast({
        title: "Event Recorded",
        description: `${variables.event_type} event has been successfully recorded on the blockchain.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Record Event",
        description: error.message || "An error occurred while recording the event.",
        variant: "destructive",
      });
    },
  });
};
