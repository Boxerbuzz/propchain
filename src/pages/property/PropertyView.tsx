import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Bed, Bath, Calendar, DollarSign, Edit, Image, FileText, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyView = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Property not found or you don't have permission to view it.</p>
            <Link to="/property/management">
              <Button className="mt-4">Back to Management</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryImage = property.property_images?.find(img => img.is_primary)?.image_url || 
                      property.property_images?.[0]?.image_url || 
                      "/placeholder.svg";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{(property.location as any)?.address}, {(property.location as any)?.city}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/property/${propertyId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Property
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-0">
            <img
              src={primaryImage}
              alt={property.title}
              className="w-full h-96 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <div className="text-sm text-muted-foreground">
                Images: {property.property_images?.length || 0} • Documents: {property.property_documents?.length || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={property.approval_status === 'approved' ? 'default' : 'secondary'}>
                  {property.approval_status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span>{property.property_type}</span>
              </div>

              {property.bedrooms && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    Bedrooms
                  </span>
                  <span>{property.bedrooms}</span>
                </div>
              )}

              {property.bathrooms && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    Bathrooms
                  </span>
                  <span>{property.bathrooms}</span>
                </div>
              )}

              {property.year_built && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Year Built
                  </span>
                  <span>{property.year_built}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Estimated Value
                </span>
                <span>₦{property.estimated_value?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.tokenizations && property.tokenizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tokenization Status</CardTitle>
              </CardHeader>
              <CardContent>
                {property.tokenizations.map((tokenization) => (
                  <div key={tokenization.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge>{tokenization.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Target Raise</span>
                      <span>₦{tokenization.target_raise?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Raise</span>
                      <span>₦{tokenization.current_raise?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyView;