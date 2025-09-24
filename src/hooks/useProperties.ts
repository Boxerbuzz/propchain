import { useState, useEffect } from "react";
import { tokenizationApi } from "../api/tokenizations";
import { Tokenization } from "../types";
import { toast } from "react-hot-toast";

interface PropertyWithTokenization extends Tokenization {
  property_title: string;
  property_location: any;
  property_type: string;
  primary_image?: string;
  image_count: number;
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
      
      const response = await tokenizationApi.listTokenizations(filters);
      
      if (response.success && response.data) {
        setProperties(response.data as PropertyWithTokenization[]);
      } else {
        setError(response.error || "Failed to fetch properties");
        toast.error("Failed to load properties");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching properties";
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
    refetch
  };
};