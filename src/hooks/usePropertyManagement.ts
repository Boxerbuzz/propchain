import { useState, useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface PropertyWithMetrics {
  id: string;
  title: string;
  location: any;
  property_type: string;
  estimated_value: number;
  approval_status: string;
  listing_status: string;
  created_at: string;
  tokenizations?: any[];
  property_images?: any[];
  // Calculated metrics
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
  occupancyRate: number;
  fundingProgress: number;
  investors: number;
  totalTokens: number;
  soldTokens: number;
  avgMonthlyReturn: number;
  maintenanceRequests: number;
  pendingIssues: number;
  status: string;
  primaryImage?: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  avgMonthlyReturn: number;
  propertiesManaged: number;
  totalInvestors: number;
}

interface UsePropertyManagementReturn {
  properties: PropertyWithMetrics[];
  financialSummary: FinancialSummary;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateProperty: (propertyId: string, updates: any) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
}

export const usePropertyManagement = (): UsePropertyManagementReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<PropertyWithMetrics[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    occupancyRate: 0,
    avgMonthlyReturn: 0,
    propertiesManaged: 0,
    totalInvestors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = (property: any): PropertyWithMetrics => {
    const tokenization = property.tokenizations?.[0];
    
    // Calculate basic metrics (using mock values for now, will be replaced with real financial data)
    const estimatedMonthlyRevenue = property.estimated_value * 0.008; // 0.8% monthly
    const estimatedExpenses = estimatedMonthlyRevenue * 0.35; // 35% expense ratio
    
    return {
      ...property,
      monthlyRevenue: estimatedMonthlyRevenue,
      monthlyExpenses: estimatedExpenses,
      netIncome: estimatedMonthlyRevenue - estimatedExpenses,
      occupancyRate: 92, // Default occupancy rate
      fundingProgress: tokenization ? (tokenization.tokens_sold / tokenization.total_supply) * 100 : 0,
      investors: tokenization?.investor_count || 0,
      totalTokens: tokenization?.total_supply || 0,
      soldTokens: tokenization?.tokens_sold || 0,
      avgMonthlyReturn: 7.2, // Default return rate
      maintenanceRequests: Math.floor(Math.random() * 3), // Random for now
      pendingIssues: Math.floor(Math.random() * 2), // Random for now
      status: property.listing_status === 'active' ? 
        (tokenization?.status === 'completed' ? 'funded' : 'active') : 
        property.listing_status,
      primaryImage: property.property_images?.find((img: any) => img.is_primary)?.image_url || 
                   property.property_images?.[0]?.image_url || 
                   '/placeholder.svg',
    };
  };

  const fetchProperties = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const rawProperties = await supabaseService.properties.getOwnedProperties(user.id);
      const propertiesWithMetrics = rawProperties.map(calculateMetrics);
      
      setProperties(propertiesWithMetrics);
      
      // Calculate financial summary
      const summary = propertiesWithMetrics.reduce((acc, prop) => ({
        totalRevenue: acc.totalRevenue + prop.monthlyRevenue,
        totalExpenses: acc.totalExpenses + prop.monthlyExpenses,
        netProfit: acc.netProfit + prop.netIncome,
        totalInvestors: acc.totalInvestors + prop.investors,
        propertiesManaged: acc.propertiesManaged + 1,
        occupancyRate: 0, // Will be calculated after
        avgMonthlyReturn: 0, // Will be calculated after
      }), {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalInvestors: 0,
        propertiesManaged: 0,
        occupancyRate: 0,
        avgMonthlyReturn: 0,
      });

      // Calculate averages
      if (summary.propertiesManaged > 0) {
        summary.occupancyRate = propertiesWithMetrics.reduce((acc, prop) => acc + prop.occupancyRate, 0) / summary.propertiesManaged;
        summary.avgMonthlyReturn = propertiesWithMetrics.reduce((acc, prop) => acc + prop.avgMonthlyReturn, 0) / summary.propertiesManaged;
      }

      setFinancialSummary(summary);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch properties";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProperty = async (propertyId: string, updates: any) => {
    try {
      await supabaseService.properties.updateProperty(propertyId, updates);
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      await fetchProperties(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      await supabaseService.properties.deleteProperty(propertyId);
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      await fetchProperties(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const refetch = () => {
    fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  return {
    properties,
    financialSummary,
    isLoading,
    error,
    refetch,
    updateProperty,
    deleteProperty,
  };
};