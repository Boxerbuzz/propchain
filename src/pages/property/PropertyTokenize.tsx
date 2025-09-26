import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Plus } from "lucide-react";
import { useTokenizationHederaSetup } from "@/hooks/useTokenizationHederaSetup";
import { TokenizationDialog } from "@/components/TokenizationDialog";

const PropertyTokenize = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Setup Hedera token creation for auto-approved tokenizations
  useTokenizationHederaSetup();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  // Auto-open dialog when component mounts
  useEffect(() => {
    if (property && !property.tokenizations?.length) {
      setDialogOpen(true);
    }
  }, [property]);

  const handleSuccess = () => {
    navigate(`/property/${propertyId}/view`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Property not found or you don't have permission to tokenize it.</p>
            <Button onClick={() => navigate("/property/management")} className="mt-4">
              Back to Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already tokenized
  const existingTokenization = property.tokenizations?.[0];
  if (existingTokenization) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Property Already Tokenized</h2>
            <p className="text-muted-foreground mb-4">
              This property has already been tokenized with status: {existingTokenization.status}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate(`/property/${propertyId}/view`)}>
                View Property
              </Button>
              <Button variant="outline" onClick={() => navigate("/property/management")}>
                Back to Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tokenize Property</h1>
          <p className="text-muted-foreground mt-2">{property.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/property/${propertyId}/view`)}>
          Cancel
        </Button>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Tokenization allows you to raise funds from investors by creating digital tokens representing ownership shares in your property.
          Property value: ₦{property.estimated_value?.toLocaleString()}
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Tokenize</h3>
            <p className="text-muted-foreground mb-6">
              Create digital tokens for your property to enable fractional ownership and raise investment funds.
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              Start Tokenization
            </Button>
          </div>
        </CardContent>
      </Card>

      <TokenizationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        property={property}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default PropertyTokenize;