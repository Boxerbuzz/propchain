import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

export const PropertyImageManager = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.properties.getPropertyById(propertyId!);
      setProperty(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return <div className="container mx-auto px-4 py-8">Property not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/property/management")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Management
        </Button>
        
        <h1 className="text-2xl font-bold">Property Images</h1>
        <p className="text-muted-foreground">{property.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Property Images</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyImageUpload
            propertyId={propertyId!}
            existingImages={property.property_images || []}
            onUploadComplete={fetchProperty}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyImageManager;