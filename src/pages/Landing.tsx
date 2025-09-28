import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Building,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  // Fetch real featured properties data
  const { data: tokenizations = [], isLoading: propertiesLoading } =
    useProperties();

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [propertiesResult, investmentsResult, usersResult] =
        await Promise.all([
          supabase
            .from("properties")
            .select("id, estimated_value")
            .eq("approval_status", "approved"),
          supabase
            .from("investments")
            .select("amount_ngn, created_at")
            .eq("payment_status", "confirmed"),
          supabase.from("users").select("id", { count: "exact" }),
        ]);

      const properties = propertiesResult.data || [];
      const investments = investmentsResult.data || [];
      const usersCount = usersResult.count || 0;

      const totalInvested = investments.reduce(
        (sum, inv) => sum + (inv.amount_ngn || 0),
        0
      );
      const avgReturn = investments.length > 0 ? 12.5 : 0; // This could be calculated from actual returns

      return {
        propertiesCount: properties.length,
        investorsCount: usersCount,
        totalInvested,
        avgReturn,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform tokenizations to property cards format
  const featuredProperties = tokenizations.slice(0, 3).map((tokenization) => {
    let status: "active" | "upcoming" | "funded" = "upcoming";
    if (tokenization.status === "active") status = "active";
    else if (tokenization.status === "completed") status = "funded";

    return {
      id: tokenization.id,
      property_id: tokenization.property_id,
      title: tokenization.property_title || "Property Investment",
      location:
        typeof tokenization.property_location === "object"
          ? `${tokenization.property_location?.city || ""}, ${
              tokenization.property_location?.state || ""
            }`
              .trim()
              .replace(/^,|,$/g, "") || "Nigeria"
          : tokenization.property_location || "Nigeria",
      price: tokenization.target_raise || tokenization.current_raise || 0,
      expectedReturn: tokenization.expected_roi_annual || 0,
      tokensSold: Number(tokenization.tokens_sold) || 0,
      totalTokens: Number(tokenization.total_supply) || 1,
      investmentDeadline: tokenization.investment_window_end
        ? new Date(tokenization.investment_window_end).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
        : "TBD",
      imageUrl:
        tokenization.primary_image ||
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      status,
    };
  });

  const platformStats = [
    {
      label: "Total Properties",
      value: statsLoading ? "..." : `${stats?.propertiesCount || 0}+`,
      icon: Building,
    },
    {
      label: "Active Investors",
      value: statsLoading ? "..." : `${stats?.investorsCount || 0}+`,
      icon: Users,
    },
    {
      label: "Total Invested",
      value: statsLoading
        ? "..."
        : `₦${((stats?.totalInvested || 0) / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
    },
    {
      label: "Average Returns",
      value: statsLoading ? "..." : `${stats?.avgReturn || 0}%`,
      icon: Shield,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Regulated",
      description:
        "Built on Hedera Hashgraph with full regulatory compliance and investor protection.",
    },
    {
      icon: Zap,
      title: "Instant Trading",
      description:
        "Buy and sell property tokens instantly with transparent pricing and low fees.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description:
        "Invest in premium Nigerian real estate from anywhere in the world.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="status-verified mb-6">
              Now Live on Hedera Mainnet
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Invest in Real Estate
              <span className="text-primary block">
                Through Blockchain Tokens
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PropChain makes premium real estate accessible to everyone. Own
              fractions of high-value properties, earn rental income, and trade
              your ownership tokens on our secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/browse">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/auth/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-muted">
        <div className="container mx-auto mobile-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    {stat.value}
                  </h3>
                )}
                <p className="text-muted-foreground mobile-text">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto mobile-padding">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Featured Investment Opportunities
            </h2>
            <p className="text-muted-foreground mobile-text max-w-2xl mx-auto">
              Discover high-yield real estate investments carefully selected by
              our team
            </p>
          </div>

          {propertiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8 md:mb-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Properties Available
              </h3>
              <p className="text-muted-foreground">
                New investment opportunities will be available soon.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link to="/browse">
              <Button size="lg" variant="outline" className="mobile-text">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose PropChain?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for the future of real estate investment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Investing?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of investors who are already building wealth
              through tokenized real estate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}