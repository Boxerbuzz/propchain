import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseService } from "@/services/supabaseService";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import { PropertyDocumentUpload } from "@/components/PropertyDocumentUpload";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  MapPin,
  DollarSign,
  Camera,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const propertyEditSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  property_type: z.string().min(1, "Property type is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  estimated_value: z
    .number()
    .min(100000, "Property value must be at least ₦100,000"),
  rental_income_monthly: z
    .number()
    .min(0, "Rental income cannot be negative")
    .optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  year_built: z.number().min(1900).max(new Date().getFullYear()).optional(),
});

type PropertyEditForm = z.infer<typeof propertyEditSchema>;

const PropertyEdit: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  const form = useForm<PropertyEditForm>({
    resolver: zodResolver(propertyEditSchema),
    defaultValues: {
      title: "",
      property_type: "",
      estimated_value: 0,
      bedrooms: 0,
      bathrooms: 0,
      year_built: 2023,
      address: "",
      city: "",
      state: "",
      description: "",
      rental_income_monthly: 0,
    },
  });

  // Reset form when property data loads
  React.useEffect(() => {
    if (property) {
      const location = property.location as any;
      form.reset({
        title: property.title || "",
        property_type: property.property_type || "",
        estimated_value: Number(property.estimated_value) || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        year_built: property.year_built || 2023,
        address: location?.address || "",
        city: location?.city || "",
        state: location?.state || "",
        description: property.description || "",
        rental_income_monthly: Number(property.rental_income_monthly) || 0,
      });
    }
  }, [property, form]);

  const propertyTypes = ["residential", "commercial", "industrial", "land"];

  // Helper functions for number formatting
  const formatNumber = (value: number | string): string => {
    if (!value && value !== 0) return "";
    const numValue =
      typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(numValue)) return "";
    return numValue.toLocaleString("en-US");
  };

  const parseFormattedNumber = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/,/g, "");
    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger([
        "title",
        "description",
        "property_type",
      ]);
      if (!isValid) return;
    }
    if (step === 2) {
      const isValid = await form.trigger(["address", "city", "state"]);
      if (!isValid) return;
    }
    if (step === 3) {
      const isValid = await form.trigger(["estimated_value"]);
      if (!isValid) return;
    }

    if (step < 5) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const getStepProgress = () => ((step - 1) / 4) * 100;

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await supabaseService.properties.updateProperty(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property", propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-properties"] });
      toast.success("Property updated successfully!");
      // Only move to next step if we're on step 3 (the form submission step)
      if (step === 3) {
        setStep(4); // Move to images step
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update property");
    },
  });

  const onSubmit = (data: PropertyEditForm) => {
    // Remove individual location fields from root and create location object
    const { address, city, state, ...propertyData } = data;

    updatePropertyMutation.mutate({
      id: propertyId!,
      data: {
        ...propertyData,
        location: {
          address,
          city,
          state,
          country: "Nigeria",
        },
      },
    });
  };

  const handleImagesUploaded = () => {
    toast.success("Images updated successfully!");
    setStep(5); // Move to documents step
  };

  const handleDocumentsUploaded = () => {
    toast.success("Documents updated successfully!");
    // Stay on step 5 - this is the final step
  };

  const handleFinalSubmit = () => {
    toast.success("Property updated successfully!");
    navigate(-1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Luxury Apartment Complex in Victoria Island"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Detailed description of the property..."
                    rows={4}
                  />
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
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 123 Ahmadu Bello Way" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Lagos" />
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
                    <Input {...field} placeholder="e.g., Lagos State" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Property Valuation & Details
        </h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="estimated_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Value (₦)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={formatNumber(field.value)}
                    onChange={(e) => {
                      const numericValue = parseFormattedNumber(e.target.value);
                      field.onChange(numericValue);
                    }}
                    placeholder="e.g., 500,000,000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rental_income_monthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rental Income (₦)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={formatNumber(field.value)}
                    onChange={(e) => {
                      const numericValue = parseFormattedNumber(e.target.value);
                      field.onChange(numericValue);
                    }}
                    placeholder="e.g., 2,500,000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={`grid gap-4 ${form.watch("property_type") === "residential" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
            {form.watch("property_type") === "residential" && (
              <>
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
                          placeholder="0"
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
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                      placeholder="2020"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Update Property Images</h3>
        <p className="text-muted-foreground mb-6">
          Manage your property images to showcase it to potential investors.
        </p>
        {propertyId && (
          <PropertyImageUpload
            propertyId={propertyId}
            existingImages={property?.property_images || []}
            onUploadComplete={handleImagesUploaded}
          />
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Update Property Documents
        </h3>
        <p className="text-muted-foreground mb-6">
          Manage legal documents, certificates, and other required paperwork.
        </p>
        {propertyId && (
          <PropertyDocumentUpload
            propertyId={propertyId}
            existingDocuments={property?.property_documents || []}
            onUploadComplete={handleDocumentsUploaded}
          />
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Property not found</p>
            <Link to="/property/management">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Management
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { step: 1, title: "Property Details", icon: FileText },
    { step: 2, title: "Location", icon: MapPin },
    { step: 3, title: "Valuation", icon: DollarSign },
    { step: 4, title: "Images", icon: Camera },
    { step: 5, title: "Documents", icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Edit Property
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Update your property information using the same steps as creation
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-muted/30 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 overflow-x-auto">
              {steps.map((stepInfo, index) => {
                const Icon = stepInfo.icon;
                const isActive = step === stepInfo.step;
                const isCompleted = step > stepInfo.step;

                return (
                  <div
                    key={stepInfo.step}
                    className="flex items-center min-w-0"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 
                        ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground bg-background text-muted-foreground"
                        }
                      `}
                      >
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="mt-2 text-center hidden sm:block">
                        <div
                          className={`text-xs font-medium ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Step {stepInfo.step}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {stepInfo.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                          isCompleted ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Property Details"}
              {step === 2 && "Location Information"}
              {step === 3 && "Property Valuation & Details"}
              {step === 4 && "Update Property Images"}
              {step === 5 && "Update Property Documents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 4 || step === 5 ? (
              // Upload steps - outside of form to prevent conflicts
              <div className="space-y-6">
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
              </div>
            ) : (
              <Form {...form}>
                <form className="space-y-6">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </form>
              </Form>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                ) : step === 3 ? (
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={updatePropertyMutation.isPending}
                  >
                    {updatePropertyMutation.isPending
                      ? "Updating..."
                      : "Update & Continue"}
                  </Button>
                ) : step < 5 ? (
                  <Button type="button" onClick={handleNext}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={handleFinalSubmit}>
                    Finish Update
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyEdit;
