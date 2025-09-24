import { useState, useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "react-hot-toast";

interface PropertyWithTokenization {
  id?: string;
  property_title?: string;
  property_location?: any;
  property_type?: string;
  primary_image?: string;
  image_count?: number;
  // Tokenization fields
  status?: string;
  target_raise?: number;
  current_raise?: number;
  expected_roi_annual?: number;
  tokens_sold?: number;
  total_supply?: number;
  investment_window_end?: string;
  price_per_token?: number;
  min_investment?: number;
  // Include other relevant fields
  [key: string]: any;
}

interface UsePropertiesReturn {
  properties: PropertyWithTokenization[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProperties = (filters?: any): UsePropertiesReturn => {
  const [properties, setProperties] = useState<PropertyWithTokenization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tokenizations =
        await supabaseService.properties.listActiveTokenizations();

      // Map to include property info
      const mappedProperties = tokenizations.map((tokenization: any) => ({
        ...tokenization,
        property_title: tokenization.properties?.title || "Unknown Property",
        property_location: tokenization.properties?.location || {},
        property_type: tokenization.properties?.property_type || "Unknown",
        primary_image: null, // We'll need a separate query for images if needed
        image_count: 0,
      }));

      setProperties(mappedProperties);
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred while fetching properties";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  return {
    properties,
    isLoading,
    error,
    refetch,
  };
};
