import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import MoneyInput from '@/components/ui/money-input';

const propertyEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  property_type: z.string().min(1, "Property type is required"),
  property_subtype: z.string().optional(),
  condition: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  year_built: z.number().optional(),
  estimated_value: z.number().min(1, "Estimated value is required"),
  market_value: z.number().optional(),
  rental_income_monthly: z.number().optional(),
  land_size: z.number().optional(),
  built_up_area: z.number().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

type PropertyEditForm = z.infer<typeof propertyEditSchema>;

const PropertyEdit = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  const form = useForm<PropertyEditForm>({
    resolver: zodResolver(propertyEditSchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "",
      property_subtype: "",
      condition: "",
      bedrooms: 0,
      bathrooms: 0,
      year_built: 0,
      estimated_value: 0,
      market_value: 0,
      rental_income_monthly: 0,
      land_size: 0,
      built_up_area: 0,
      address: "",
      city: "",
      state: "",
    },
  });

  // Update form when property data loads
  React.useEffect(() => {
    if (property) {
      form.reset({
        title: property.title || "",
        description: property.description || "",
        property_type: property.property_type || "",
        property_subtype: property.property_subtype || "",
        condition: property.condition || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        year_built: property.year_built || 0,
        estimated_value: property.estimated_value || 0,
        market_value: property.market_value || 0,
        rental_income_monthly: property.rental_income_monthly || 0,
        land_size: property.land_size || 0,
        built_up_area: property.built_up_area || 0,
        address: (property.location as any)?.address || "",
        city: (property.location as any)?.city || "",
        state: (property.location as any)?.state || "",
      });
    }
  }, [property, form]);

  const updatePropertyMutation = useMutation({
    mutationFn: (data: PropertyEditForm) => {
      const updateData = {
        ...data,
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
        },
      };
      // Remove address, city, state from root level
      delete (updateData as any).address;
      delete (updateData as any).city;
      delete (updateData as any).state;
      
      return supabaseService.properties.updateProperty(propertyId!, updateData);
    },
    onSuccess: () => {
      toast.success("Property updated successfully");
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["user-properties"] });
      navigate(`/property/${propertyId}/view`);
    },
    onError: (error) => {
      toast.error("Failed to update property: " + error.message);
    },
  });

  const onSubmit = (data: PropertyEditForm) => {
    updatePropertyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
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
            <p className="text-muted-foreground">Property not found or you don't have permission to edit it.</p>
            <Button onClick={() => navigate("/property/management")} className="mt-4">
              Back to Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <Button variant="outline" onClick={() => navigate(`/property/${propertyId}/view`)}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter property title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter estimated value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Number of bedrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Number of bathrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year_built"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Year built"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Property address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="State" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the property..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/property/${propertyId}/view`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePropertyMutation.isPending}>
                  {updatePropertyMutation.isPending ? "Updating..." : "Update Property"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyEdit;