import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import MoneyInput from '@/components/ui/money-input';

const tokenizationSchema = z.object({
  token_name: z.string().min(1, "Token name is required"),
  token_symbol: z.string().min(2, "Token symbol must be at least 2 characters").max(10, "Token symbol must be at most 10 characters"),
  total_supply: z.number().min(1000, "Minimum total supply is 1,000 tokens"),
  price_per_token: z.number().min(0.01, "Price per token must be at least 0.01"),
  min_investment: z.number().min(1, "Minimum investment is required"),
  max_investment: z.number().optional(),
  target_raise: z.number().min(1, "Target raise is required"),
  minimum_raise: z.number().min(1, "Minimum raise is required"),
  investment_window_days: z.number().min(1, "Investment window must be at least 1 day").max(365, "Investment window cannot exceed 365 days"),
  expected_roi_annual: z.number().min(0).max(100).optional(),
  dividend_frequency: z.string().optional(),
  management_fee_percentage: z.number().min(0).max(10).optional(),
});

type TokenizationForm = z.infer<typeof tokenizationSchema>;

const PropertyTokenize = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  const form = useForm<TokenizationForm>({
    resolver: zodResolver(tokenizationSchema),
    defaultValues: {
      token_name: "",
      token_symbol: "",
      total_supply: 10000,
      price_per_token: 100,
      min_investment: 10000,
      max_investment: 1000000,
      target_raise: 0,
      minimum_raise: 0,
      investment_window_days: 30,
      expected_roi_annual: 8,
      dividend_frequency: "quarterly",
      management_fee_percentage: 2.5,
    },
  });

  // Update form defaults when property loads
  React.useEffect(() => {
    if (property) {
      const estimatedValue = property.estimated_value || 0;
      const suggestedTargetRaise = Math.floor(estimatedValue * 0.8); // 80% of property value
      const suggestedMinimumRaise = Math.floor(estimatedValue * 0.3); // 30% of property value
      
      form.setValue("token_name", `${property.title} Token`);
      form.setValue("token_symbol", property.title.substring(0, 6).toUpperCase().replace(/[^A-Z]/g, ''));
      form.setValue("target_raise", suggestedTargetRaise);
      form.setValue("minimum_raise", suggestedMinimumRaise);
    }
  }, [property, form]);

  const createTokenizationMutation = useMutation({
    mutationFn: (data: TokenizationForm) => {
      const tokenizationData = {
        property_id: propertyId!,
        ...data,
        investment_window_start: new Date(),
        investment_window_end: new Date(Date.now() + data.investment_window_days * 24 * 60 * 60 * 1000),
        status: 'draft',
      };
      
      return supabaseService.tokenizations.create(tokenizationData);
    },
    onSuccess: () => {
      toast.success("Tokenization created successfully");
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      navigate(`/property/${propertyId}/view`);
    },
    onError: (error) => {
      toast.error("Failed to create tokenization: " + error.message);
    },
  });

  const onSubmit = (data: TokenizationForm) => {
    createTokenizationMutation.mutate(data);
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
        <CardHeader>
          <CardTitle>Tokenization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="token_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Luxury Apartment Token" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token_symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., LAT" maxLength={10} />
                      </FormControl>
                      <FormDescription>2-10 characters, letters only</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_supply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Token Supply</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="10000"
                        />
                      </FormControl>
                      <FormDescription>Number of tokens to create</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_per_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Token</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_raise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Raise</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="1000000"
                        />
                      </FormControl>
                      <FormDescription>Goal amount to raise</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_raise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Raise</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="300000"
                        />
                      </FormControl>
                      <FormDescription>Minimum amount needed to proceed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_investment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Investment</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="10000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_investment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Investment</FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="1000000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_window_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Window (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="30"
                        />
                      </FormControl>
                      <FormDescription>How long investors can invest</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_roi_annual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Annual ROI (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dividend_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dividend Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="management_fee_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Fee (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="2.5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/property/${propertyId}/view`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTokenizationMutation.isPending}>
                  {createTokenizationMutation.isPending ? "Creating..." : "Create Tokenization"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyTokenize;