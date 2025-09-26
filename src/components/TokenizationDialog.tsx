import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import MoneyInput from "@/components/ui/money-input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const tokenizationSchema = z.object({
  token_name: z.string().min(1, "Token name is required"),
  token_symbol: z
    .string()
    .min(2, "Token symbol must be at least 2 characters")
    .max(10, "Token symbol must be at most 10 characters"),
  total_supply: z.number().min(1000, "Minimum total supply is 1,000 tokens"),
  price_per_token: z
    .number()
    .min(0.01, "Price per token must be at least 0.01"),
  min_investment: z.number().min(1, "Minimum investment is required"),
  max_investment: z.number().optional(),
  min_tokens_per_purchase: z.number().int().min(1).optional(),
  max_tokens_per_purchase: z.number().int().min(1).optional(),
  target_raise: z.number().min(1, "Target raise is required"),
  minimum_raise: z.number().min(1, "Minimum raise is required"),
  investment_window_days: z
    .number()
    .min(1, "Investment window must be at least 1 day")
    .max(365, "Investment window cannot exceed 365 days"),
  expected_roi_annual: z.number().min(0).max(100).optional(),
  dividend_frequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
  management_fee_percentage: z.number().min(0).max(10).optional(),
  platform_fee_percentage: z.number().min(0).max(5).optional(),
  auto_refund: z.boolean().optional(),
});

type TokenizationForm = z.infer<typeof tokenizationSchema>;

interface TokenizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onSuccess?: () => void;
}

export const TokenizationDialog: React.FC<TokenizationDialogProps> = ({
  open,
  onOpenChange,
  property,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<TokenizationForm>({
    resolver: zodResolver(tokenizationSchema),
    defaultValues: {
      token_name: property ? `${property.title} Token` : "",
      token_symbol: property
        ? property.title
            .substring(0, 6)
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
        : "",
      total_supply: 10000,
      price_per_token: 100,
      min_investment: 10000,
      max_investment: 1000000,
      target_raise: property
        ? Math.floor((property.estimated_value || 0) * 0.8)
        : 0,
      minimum_raise: property
        ? Math.floor((property.estimated_value || 0) * 0.3)
        : 0,
      min_tokens_per_purchase: 1,
      max_tokens_per_purchase: 1000,
      investment_window_days: 30,
      expected_roi_annual: 8,
      dividend_frequency: "quarterly",
      management_fee_percentage: 2.5,
      platform_fee_percentage: 1.0,
      auto_refund: true,
    },
  });

  const createTokenizationMutation = useMutation({
    mutationFn: async (data: TokenizationForm) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("You must be logged in to tokenize a property.");
      }
      if (!property || property.owner_id !== user.id) {
        throw new Error("You can only tokenize properties you own.");
      }

      const {
        investment_window_days,
        max_investment,
        expected_roi_annual,
        dividend_frequency,
        management_fee_percentage,
        platform_fee_percentage,
        auto_refund,
        ...rest
      } = data;

      const now = new Date();
      const investment_window_start = now.toISOString();
      const investment_window_end = new Date(
        now.getTime() + investment_window_days * 24 * 60 * 60 * 1000
      ).toISOString();

      const payload = {
        property_id: property.id,
        token_name: String(rest.token_name).trim(),
        token_symbol: String(rest.token_symbol).trim().toUpperCase(),
        total_supply: rest.total_supply,
        price_per_token: rest.price_per_token,
        min_investment: rest.min_investment,
        max_investment: max_investment || null,
        min_tokens_per_purchase: rest.min_tokens_per_purchase || null,
        max_tokens_per_purchase: rest.max_tokens_per_purchase || null,
        target_raise: rest.target_raise,
        minimum_raise: rest.minimum_raise,
        investment_window_start,
        investment_window_end,
        expected_roi_annual: expected_roi_annual || null,
        dividend_frequency: dividend_frequency || null,
        management_fee_percentage: management_fee_percentage || null,
        platform_fee_percentage: platform_fee_percentage || null,
        auto_refund: auto_refund ?? true,
        status: "draft",
      };

      return supabaseService.tokenizations.create(payload);
    },
    onSuccess: () => {
      toast.success("Tokenization created successfully");
      queryClient.invalidateQueries({ queryKey: ["property", property?.id] });
      setStep(1);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const details = error?.details || error?.message || "Unknown error";
      const hint = error?.hint ? ` ${error.hint}` : "";
      const code = error?.code ? ` [${error.code}]` : "";
      toast.error(`Failed to create tokenization: ${details}${hint}${code}`);
    },
  });

  const onSubmit = (data: TokenizationForm) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to continue.");
      return;
    }
    if (!property || property.owner_id !== user.id) {
      toast.error("You can only tokenize your own property.");
      return;
    }
    createTokenizationMutation.mutate(data);
  };

  const nextStep = async () => {
    const isValid = await form.trigger([
      "token_name",
      "token_symbol",
      "total_supply",
      "price_per_token",
    ]);

    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tokenize Property - Step {step} of 2</DialogTitle>
          <Progress value={step * 50} className="w-full" />
        </DialogHeader>

        {property && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{property.title}</p>
            <p className="text-sm text-muted-foreground">
              Property value: ₦{property.estimated_value?.toLocaleString()}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Basic Token Information
                </h3>

                <FormField
                  control={form.control}
                  name="token_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Luxury Apartment Token"
                        />
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
                        <Input
                          {...field}
                          placeholder="e.g., LAT"
                          maxLength={10}
                        />
                      </FormControl>
                      <FormDescription>
                        2-10 characters, letters only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder="10000"
                          />
                        </FormControl>
                        <FormDescription>
                          Number of tokens to create
                        </FormDescription>
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
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Details</h3>

                <div className="grid grid-cols-2 gap-4">
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
                        <FormDescription>
                          Minimum amount needed to proceed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder="30"
                          />
                        </FormControl>
                        <FormDescription>
                          How long investors can invest
                        </FormDescription>
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder="8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dividend_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dividend Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="semi-annually">
                              Semi-Annually
                            </SelectItem>
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder="2.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              {step === 1 ? (
                <>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTokenizationMutation.isPending}
                  >
                    {createTokenizationMutation.isPending
                      ? "Creating..."
                      : "Create Tokenization"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
