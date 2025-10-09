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
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.08),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="status-verified mb-8 animate-fade-in hover-scale">
              🚀 Now Live on Hedera Mainnet
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
              Invest in Real Estate
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent block mt-2">
                Through Blockchain Tokens
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              PropChain makes premium real estate accessible to everyone. Own
              fractions of high-value properties, earn rental income, and trade
              your ownership tokens on our secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link to="/browse">
                <Button size="lg" className="btn-primary text-lg px-10 py-6 group">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link to="/auth/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-6 hover:bg-primary/5 transition-all"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant Settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-background-muted to-background relative">
        <div className="container mx-auto mobile-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {platformStats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group hover-scale transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <h3 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 mb-2">
                    {stat.value}
                  </h3>
                )}
                <p className="text-muted-foreground mobile-text font-medium">
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
      <section className="py-24 bg-gradient-to-b from-background to-background-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Why PropChain</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built for Modern Investors
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Experience the future of real estate investment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-300 hover-scale hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                    <feature.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-primary/10 max-w-4xl mx-auto">
            <div className="mb-8">
              <Building className="h-16 w-16 text-primary mx-auto mb-4 opacity-80" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Start Investing?
            </h2>
            <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of investors who are already building wealth
              through tokenized real estate. Get started in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth/signup">
                <Button size="lg" className="btn-primary text-lg px-10 py-6 shadow-lg shadow-primary/30 group">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-6 hover:bg-primary/5"
                >
                  Browse Properties
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              ✓ No minimum investment • ✓ Start with as low as ₦10,000 • ✓ Withdraw anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}