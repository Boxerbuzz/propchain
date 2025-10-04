import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Home, DollarSign } from "lucide-react";
import { useUserProperties } from "@/hooks/usePropertyManagement";
import { InspectionForm } from "./event-forms/InspectionForm";
import { RentalForm } from "./event-forms/RentalForm";
import { PurchaseForm } from "./event-forms/PurchaseForm";
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyEventSimulator = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const { data: properties = [], isLoading } = useUserProperties();

  const selectedProp = properties.find((p) => p.id === selectedProperty);

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
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property to record events" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          <span>{property.title}</span>
                          {property.hcs_topic_id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              HCS Enabled
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedProp && !selectedProp.hcs_topic_id && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ This property does not have an HCS topic ID. Events will be recorded in the database but not on the blockchain.
                </p>
              </div>
            )}

            {selectedProperty && (
              <Tabs defaultValue="inspection" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
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
              </Tabs>
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
