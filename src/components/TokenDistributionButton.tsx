import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";

export const TokenDistributionButton = () => {
  const [isDistributing, setIsDistributing] = useState(false);

  const handleDistribution = async () => {
    setIsDistributing(true);
    try {
      // Query for tokenizations that have been minted
      const { data: tokenizations, error: queryError } = await supabase
        .from("tokenizations")
        .select("id, token_name, token_symbol, token_id, status, property_id")
        .in("status", ["minted", "active"])
        .not("token_id", "is", null)
        .neq("token_id", "pending");

      if (queryError) throw queryError;

      if (!tokenizations || tokenizations.length === 0) {
        toast.info("No Pending Distributions 📋", {
          description: "No minted tokens found that require distribution",
        });
        return;
      }

      // Check each tokenization for pending investments
      const pendingTokenizations = [];
      for (const tokenization of tokenizations) {
        const { data: investments, error: invError } = await supabase
          .from("investments")
          .select("id, payment_status, tokens_requested")
          .eq("tokenization_id", tokenization.id)
          .eq("payment_status", "confirmed");

        if (!invError && investments && investments.length > 0) {
          pendingTokenizations.push({
            id: tokenization.id,
            token_name: tokenization.token_name,
            token_symbol: tokenization.token_symbol,
            pendingInvestments: investments.length,
          });
        }
      }

      if (pendingTokenizations.length === 0) {
        toast.info("No Pending Distributions 📋", {
          description: "All minted tokens have been distributed",
        });
        return;
      }

      // Process distributions
      let successCount = 0;
      let failCount = 0;
      let totalDistributed = 0;
      let totalSkipped = 0;

      for (const tokenization of pendingTokenizations) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "distribute-tokens-to-kyc-users",
            {
              body: { tokenization_id: tokenization.id },
            }
          );

          if (error) throw error;

          if (data?.success) {
            successCount++;
            totalDistributed += data.distributed_count || 0;
            totalSkipped += data.skipped_count || 0;
          } else {
            failCount++;
          }

          // Small delay between distributions
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error: any) {
          console.error(
            `Failed to distribute ${tokenization.token_symbol}:`,
            error
          );
          failCount++;
        }
      }

      // Show results
      if (failCount === 0) {
        toast.success("Token Distribution Complete! ✅", {
          description: `Distributed tokens for ${successCount} tokenization(s) to ${totalDistributed} investor(s)${totalSkipped > 0 ? `, ${totalSkipped} skipped` : ""}`,
        });
      } else if (successCount > 0) {
        toast.warning("Token Distribution Partially Complete ⚠️", {
          description: `${successCount} successful, ${failCount} failed. Check logs for details.`,
        });
      } else {
        toast.error("Distribution Failed ❌", {
          description: "All distributions failed. Please check logs.",
        });
      }
    } catch (error: any) {
      console.error("Distribution error:", error);
      toast.error("Failed to distribute tokens", {
        description: error.message || "Please try again or contact support.",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <Button
      onClick={handleDistribution}
      disabled={isDistributing}
      variant="outline"
      className="gap-2 w-full justify-start"
    >
      {isDistributing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Distributing...
        </>
      ) : (
        <>
          <Coins className="h-4 w-4" />
          Distribute Pending Tokens
        </>
      )}
    </Button>
  );
};
