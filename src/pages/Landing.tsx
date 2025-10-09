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
  CheckCircle,
  Wallet,
  FileText,
  BarChart3,
  Lock,
  Clock,
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
      icon: Wallet,
      title: "Fractional Ownership",
      description:
        "Start investing with as little as ₦10,000. Own a fraction of high-value properties that were previously out of reach.",
      stat: "From ₦10k"
    },
    {
      icon: TrendingUp,
      title: "Passive Rental Income",
      description:
        "Earn monthly rental income proportional to your ownership. Dividends are automatically distributed to your wallet.",
      stat: "Monthly Returns"
    },
    {
      icon: FileText,
      title: "Blockchain Verified",
      description:
        "Every property token is backed by real assets on Hedera Hashgraph. Full transparency with immutable ownership records.",
      stat: "100% Transparent"
    },
    {
      icon: BarChart3,
      title: "Property Appreciation",
      description:
        "Benefit from property value increases over time. Your tokens appreciate as the property value grows.",
      stat: "Capital Gains"
    },
    {
      icon: Users,
      title: "Governance Rights",
      description:
        "Vote on major property decisions like renovations, tenant selection, and sale timing. Your investment, your voice.",
      stat: "Vote & Decide"
    },
    {
      icon: Lock,
      title: "SEC Compliant",
      description:
        "Fully regulated under Nigerian securities law. All properties undergo legal verification and compliance checks.",
      stat: "Legally Protected"
    },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      icon: CheckCircle,
      title: "Create Account & Verify",
      description: "Sign up in minutes and complete KYC verification. We ensure a secure and compliant investment environment.",
    },
    {
      step: "02",
      icon: Building,
      title: "Browse Properties",
      description: "Explore tokenized properties with detailed information, location, returns, and investment terms.",
    },
    {
      step: "03",
      icon: Wallet,
      title: "Invest & Own Tokens",
      description: "Choose your investment amount and receive property tokens instantly in your wallet.",
    },
    {
      step: "04",
      icon: TrendingUp,
      title: "Earn & Grow",
      description: "Receive monthly rental income and benefit from property appreciation. Sell tokens anytime on our marketplace.",
    },
  ];

  const testimonials = [
    {
      name: "Adebayo Johnson",
      role: "Software Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo",
      content: "PropChain made it possible for me to invest in Lagos real estate while living abroad. The returns are consistent and the platform is incredibly transparent.",
      investment: "₦2.5M invested",
      returns: "12% annual return"
    },
    {
      name: "Chioma Okafor",
      role: "Business Owner",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma",
      content: "I started with just ₦50,000 to test the platform. Now I own tokens in 5 different properties. The monthly dividends are a great passive income stream.",
      investment: "₦800K invested",
      returns: "₦9,600 monthly"
    },
    {
      name: "Emmanuel Obi",
      role: "Healthcare Professional",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emmanuel",
      content: "The governance feature is brilliant. I actually have a say in property management decisions. It's not just investing, it's real ownership.",
      investment: "₦1.2M invested",
      returns: "15% annual return"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="status-verified mb-6">
              🚀 Now Live on Hedera Mainnet
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Own Real Estate with{" "}
              <span className="text-primary">
                As Little As ₦10,000
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Invest in fractions of premium Nigerian properties through blockchain tokens. 
              Earn monthly rental income, participate in governance, and trade your ownership anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/browse">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/auth/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Instant Ownership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-muted">
        <div className="container mx-auto mobile-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start investing in real estate in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border"></div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 relative">
                    <step.icon className="h-10 w-10 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Invest Through PropChain?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to build a diversified real estate portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.stat}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Investors Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of satisfied investors building wealth through tokenized real estate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-xl p-8 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full bg-muted"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.investment}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Returns</p>
                    <p className="font-semibold text-primary text-sm">
                      {testimonial.returns}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background-muted">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Building Your Real Estate Portfolio Today
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of Nigerians investing in premium properties through blockchain technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/auth/signup">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  View Properties
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              ✓ No hidden fees • ✓ SEC compliant • ✓ Instant ownership transfer
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}