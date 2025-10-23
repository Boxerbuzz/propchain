import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  MapPin,
  DollarSign,
  Upload,
  CheckCircle,
  Camera,
  FileImage,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PropertyDocumentUpload } from "@/components/PropertyDocumentUpload";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import MoneyInput from "@/components/ui/money-input";
import { useQuery } from "@tanstack/react-query";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  property_type: z.string().min(1, "Property type is required"),
  property_subtype: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().default("Nigeria"),
  estimated_value: z
    .number()
    .min(100000, "Property value must be at least ₦100,000"),
  rental_income_monthly: z
    .number()
    .min(0, "Rental income cannot be negative")
    .optional(),
  land_size: z.number().min(0).optional(),
  built_up_area: z.number().min(0).optional(),
  condition: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  year_built: z.number().min(1900).max(new Date().getFullYear()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const RegisterProperty = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      estimated_value: 0,
      rental_income_monthly: 0,
      bedrooms: 0,
      bathrooms: 0,
      year_built: new Date().getFullYear(),
    },
  });

  const propertyTypes = ["residential", "commercial", "industrial", "land"];

  // Clear any previous draft on mount to start fresh
  useEffect(() => {
    localStorage.removeItem('draft_property_id');
    setPropertyId(null);
  }, []);

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
      
      // Create property here if not already created
      if (!propertyId) {
        await createProperty();
      }
    }

    if (step < 6) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const createProperty = async () => {
    if (!user) {
      toast.error("Please log in to register a property");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const propertyData = {
        ...data,
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
        },
      };

      // Remove individual location fields from root
      delete (propertyData as any).address;
      delete (propertyData as any).city;
      delete (propertyData as any).state;
      delete (propertyData as any).country;

      const property = await supabaseService.properties.create(
        propertyData,
        user.id
      );
      setPropertyId(property.id);
      // Persist to localStorage in case user navigates away
      localStorage.setItem('draft_property_id', property.id);
      
      toast.success("Property details saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create property");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesUploaded = () => {
    // Upload complete - user can upload more or click Next to continue
  };

  const handleDocumentsUploaded = () => {
    // Upload complete - user can upload more or click Next to continue
  };

  const handleFinalSubmit = async () => {
    if (!propertyId) {
      toast.error("Property not found. Please go back and save details.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Update property status to submitted for review
      await supabaseService.properties.updateProperty(propertyId, {
        listing_status: 'pending_review',
        approval_status: 'pending'
      });
      
      // Clear draft from localStorage
      localStorage.removeItem('draft_property_id');
      
      toast.success("Property submitted for review successfully!");
      navigate("/property/management");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => ((step - 1) / 5) * 100;

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

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const propertyType = form.watch("property_type");
    const isLand = propertyType === "land";
    const isResidential = propertyType === "residential";
    const isCommercial = propertyType === "commercial";
    const isIndustrial = propertyType === "industrial";

    const propertySubtypes = {
      residential: ["Apartment", "House", "Villa", "Townhouse", "Duplex", "Penthouse"],
      commercial: ["Office", "Retail", "Hotel", "Restaurant", "Shopping Complex", "Warehouse"],
      industrial: ["Warehouse", "Factory", "Manufacturing Plant", "Storage Facility", "Distribution Center"],
      land: ["Residential Plot", "Commercial Plot", "Agricultural Land", "Mixed Use"],
    };

    return (
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
                  <FormLabel>Property Value</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value || 0}
                      onValueChange={field.onChange}
                      currency="₦"
                      placeholder="0"
                      min={100000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isLand && (
              <FormField
                control={form.control}
                name="rental_income_monthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rental Income</FormLabel>
                    <FormControl>
                      <MoneyInput
                        value={field.value || 0}
                        onValueChange={field.onChange}
                        currency="₦"
                        placeholder="0"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="land_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Size (sqm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="e.g., 500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLand && (
                <FormField
                  control={form.control}
                  name="built_up_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Built-up Area (sqm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="e.g., 350"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {propertyType && (
              <FormField
                control={form.control}
                name="property_subtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Subtype</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property subtype" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertySubtypes[propertyType as keyof typeof propertySubtypes]?.map((subtype) => (
                          <SelectItem key={subtype} value={subtype.toLowerCase().replace(/\s+/g, "_")}>
                            {subtype}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={`grid gap-4 ${isResidential ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
              {isResidential && (
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
                    <FormLabel>{isLand ? "Year Acquired" : "Year Built"}</FormLabel>
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
  };

  // Fetch existing property images
  const { data: existingImages = [], refetch: refetchImages } = useQuery({
    queryKey: ["property-images", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      return await supabaseService.properties.getPropertyImages(propertyId);
    },
    enabled: !!propertyId,
  });

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Property Images</h3>
        <p className="text-muted-foreground mb-6">
          Add high-quality images to showcase your property to potential
          investors.
        </p>
        {propertyId && (
          <PropertyImageUpload
            propertyId={propertyId}
            existingImages={existingImages}
            onUploadComplete={() => {
              refetchImages();
              handleImagesUploaded();
            }}
          />
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileImage className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Upload Property Documents
        </h3>
        <p className="text-muted-foreground mb-6">
          Upload legal documents, certificates, and other required paperwork.
        </p>
        {propertyId && (
          <PropertyDocumentUpload
            propertyId={propertyId}
            onUploadComplete={handleDocumentsUploaded}
          />
        )}
      </div>
    </div>
  );

  const renderStep6 = () => {
    const formData = form.getValues();
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{formData.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span>
                  {formData.city}, {formData.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Property Value:</span>
                <span>₦{formData.estimated_value?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Monthly Rental:</span>
                <span>₦{formData.rental_income_monthly?.toLocaleString()}</span>
              </div>
              {formData.bedrooms && formData.bedrooms > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Bedrooms:</span>
                  <span>{formData.bedrooms}</span>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready for Review</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your property details, images, and documents have been uploaded
              successfully. Click submit to send your property for admin review
              and approval.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const steps = [
    { step: 1, title: "Property Details", icon: FileText },
    { step: 2, title: "Location", icon: MapPin },
    { step: 3, title: "Valuation", icon: DollarSign },
    { step: 4, title: "Images", icon: Camera },
    { step: 5, title: "Documents", icon: Upload },
    { step: 6, title: "Review", icon: CheckCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Register Property
        </h1>
        <p className="text-muted-foreground">
          Submit your property for tokenization on PropChain
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Step {step} of 6</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(getStepProgress())}% Complete
          </span>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((item) => {
                const IconComponent = item.icon;
                const isActive = step === item.step;
                const isCompleted = step > item.step;

                return (
                  <div
                    key={item.step}
                    className={`flex items-center gap-3 ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-success text-white"
                          : "bg-muted"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Step {step} of 6</CardTitle>
                <Badge variant="outline">Property Registration</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()}>
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                  {step === 4 && renderStep4()}
                  {step === 5 && renderStep5()}
                  {step === 6 && renderStep6()}

                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>

                    {step < 6 ? (
                      <Button 
                        type="button" 
                        onClick={handleNext}
                        disabled={isSubmitting || (step > 3 && !propertyId)}
                      >
                        {isSubmitting && step === 3 ? "Saving..." : "Next"}
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Review"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterProperty;
