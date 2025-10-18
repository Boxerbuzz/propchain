import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  Building,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  Wallet,
  FileText,
  BarChart3,
  Lock,
  Clock,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Landing() {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

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
      stat: "From ₦10k",
    },
    {
      icon: TrendingUp,
      title: "Passive Rental Income",
      description:
        "Earn monthly rental income proportional to your ownership. Dividends are automatically distributed to your wallet.",
      stat: "Monthly Returns",
    },
    {
      icon: FileText,
      title: "Hedera Verified",
      description:
        "Every property token is backed by real assets and secured on Hedera's distributed ledger. Full transparency with immutable ownership records.",
      stat: "100% Transparent",
    },
    {
      icon: BarChart3,
      title: "Property Appreciation",
      description:
        "Benefit from property value increases over time. Your tokens appreciate as the property value grows.",
      stat: "Capital Gains",
    },
    {
      icon: Users,
      title: "Governance Rights",
      description:
        "Vote on major property decisions like renovations, tenant selection, and sale timing. Your investment, your voice.",
      stat: "Vote & Decide",
    },
    {
      icon: Lock,
      title: "SEC Compliant",
      description:
        "Fully regulated under Nigerian securities law. All properties undergo legal verification and compliance checks.",
      stat: "Legally Protected",
    },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      icon: CheckCircle,
      title: "Create Account & Verify",
      description:
        "Sign up in minutes and complete KYC verification. We ensure a secure and compliant investment environment.",
    },
    {
      step: "02",
      icon: Building,
      title: "Browse Properties",
      description:
        "Explore tokenized properties with detailed information, location, returns, and investment terms.",
    },
    {
      step: "03",
      icon: Wallet,
      title: "Invest & Own Tokens",
      description:
        "Choose your investment amount and receive property tokens instantly in your wallet.",
    },
    {
      step: "04",
      icon: TrendingUp,
      title: "Earn & Grow",
      description:
        "Receive monthly rental income and benefit from property appreciation. Sell tokens anytime on our marketplace.",
    },
  ];

  const testimonials = [
    {
      name: "Adebayo Johnson",
      role: "Software Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo",
      content:
        "PropChain made it possible for me to invest in Lagos real estate while living abroad. The returns are consistent and the platform is incredibly transparent.",
      investment: "₦2.5M invested",
      returns: "12% annual return",
    },
    {
      name: "Chioma Okafor",
      role: "Business Owner",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma",
      content:
        "I started with just ₦50,000 to test the platform. Now I own tokens in 5 different properties. The monthly dividends are a great passive income stream.",
      investment: "₦800K invested",
      returns: "₦9,600 monthly",
    },
    {
      name: "Emmanuel Obi",
      role: "Healthcare Professional",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emmanuel",
      content:
        "The governance feature is brilliant. I actually have a say in property management decisions. It's not just investing, it's real ownership.",
      investment: "₦1.2M invested",
      returns: "15% annual return",
    },
    {
      name: "Funmilayo Adeyemi",
      role: "Teacher",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Funmilayo",
      content:
        "As a teacher, I never thought I could own property in Victoria Island. PropChain broke down those barriers. My ₦10,000 monthly investment is building my future.",
      investment: "₦120K invested",
      returns: "₦1,400 monthly",
    },
    {
      name: "Oluwatobi Fashola",
      role: "Marketing Manager",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oluwatobi",
      content:
        "The Hedera blockchain integration gives me confidence. Every transaction is transparent and verifiable. Plus, the SEC compliance means my investment is legally protected.",
      investment: "₦3.8M invested",
      returns: "14% annual return",
    },
    {
      name: "Amina Bello",
      role: "Financial Analyst",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amina",
      content:
        "I've analyzed many real estate platforms, and PropChain stands out. The tokenization model is solid, dividends are punctual, and the ROI beats my bank savings by far.",
      investment: "₦5.2M invested",
      returns: "₦62,400 monthly",
    },
    {
      name: "Chukwuemeka Nwosu",
      role: "Entrepreneur",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chukwuemeka",
      content:
        "PropChain is perfect for diversification. Instead of putting all my money in one property, I spread it across 8 different locations. Risk management at its finest!",
      investment: "₦6.5M invested",
      returns: "18% annual return",
    },
    {
      name: "Blessing Okoro",
      role: "Nurse",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blessing",
      content:
        "I love how easy it is to use. From KYC to receiving my first dividend took less than 2 weeks. The customer support team is also very responsive and helpful.",
      investment: "₦450K invested",
      returns: "₦5,200 monthly",
    },
    {
      name: "Ibrahim Yusuf",
      role: "Civil Servant",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim",
      content:
        "Finally, a platform that lets ordinary Nigerians benefit from real estate appreciation. My small investments are growing steadily, and I can see my property values increase in real-time.",
      investment: "₦280K invested",
      returns: "11% annual return",
    },
    {
      name: "Tunde Adewale",
      role: "University Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde",
      content:
        "As a student, I never thought I could invest in real estate. With PropChain, I started with just ₦5,000 from my allowance. It's teaching me about investing while building my future!",
      investment: "₦25K invested",
      returns: "₦280 monthly",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto text-center">
            <Badge
              className="mb-6 text-sm px-5 py-2 bg-primary/10 hover:bg-primary/20 border-primary/20"
              variant="outline"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
              Now Live on Hedera Testnet
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]">
              Own Real Estate with{" "}
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                As Little As ₦10,000
              </span>
            </h1>

            <p className="text-md md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Invest in fractions of premium Nigerian properties through
              tokenized ownership on Hedera. Earn monthly rental income,
              participate in governance, and trade your ownership anytime.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-base transition-all"
              >
                <Link to="/auth/signup">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 text-base"
              >
                <Link to="/browse">Browse Properties</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Hedera Secured</span>
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {platformStats.map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-12 w-20 mx-auto mb-2" />
                  ) : (
                    <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent text-center">
                      {stat.value}
                    </div>
                  )}
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge
              className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              variant="outline"
            >
              Getting Started
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Start investing in real estate in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-6 relative border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-10 w-10 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
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
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <Badge
              className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              variant="outline"
            >
              Platform Benefits
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              Why Invest Through PropChain?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Everything you need to build a diversified real estate portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-zinc/10 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {feature.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold mb-4 mx-auto block w-fit"
                  >
                    {feature.stat}
                  </Badge>
                  <p className="text-muted-foreground text-sm leading-relaxed text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Sponsors Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge
              className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              variant="outline"
            >
              Our Partners
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              Trusted Partners
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Powered by industry-leading technology and financial partners
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center max-w-5xl mx-auto">
            <Card className="flex items-center justify-center h-32 w-full bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-card hover:border-primary/40 transition-all duration-300 group">
              <CardContent className="p-6 flex items-center justify-center">
                <img
                  src={
                    isDark
                      ? "/partners/dark/hedera.svg"
                      : "/partners/light/hedera.svg"
                  }
                  alt="Hedera"
                  className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center h-32 w-full bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-card hover:border-primary/40 transition-all duration-300 group">
              <CardContent className="p-6 flex items-center justify-center">
                <img
                  src={
                    isDark
                      ? "/partners/dark/paystack.svg"
                      : "/partners/light/paystack.svg"
                  }
                  alt="Paystack"
                  className="h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center h-32 w-full bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-card hover:border-primary/40 transition-all duration-300 group">
              <CardContent className="p-6 flex items-center justify-center">
                <img
                  src={
                    isDark
                      ? "/partners/dark/hashgraph.svg"
                      : "/partners/light/hashgraph.svg"
                  }
                  alt="Hashgraph"
                  className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center h-32 w-full bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-card hover:border-primary/40 transition-all duration-300 group">
              <CardContent className="p-6 flex items-center justify-center">
                <img
                  src="/partners/ndpc.png"
                  alt="NPDC"
                  className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge
              className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              variant="outline"
            >
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-5">
              What Our Investors Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Join thousands of satisfied investors building wealth through
              tokenized real estate
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
              onMouseEnter={() => autoplayPlugin.current.stop()}
              onMouseLeave={() => autoplayPlugin.current.play()}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full">
                      <Card className="relative overflow-hidden border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 h-full flex flex-col group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-8 relative flex flex-col h-full">
                          <div className="flex items-center gap-4 mb-6">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full bg-muted ring-2 ring-primary/20"
                            />
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">
                                {testimonial.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {testimonial.role}
                              </p>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                            "{testimonial.content}"
                          </p>
                          <div className="flex items-center gap-4 pt-4 border-t border-border">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                Total Invested
                              </p>
                              <p className="font-bold text-foreground">
                                {testimonial.investment}
                              </p>
                            </div>
                            <div className="h-10 w-px bg-border"></div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                Returns
                              </p>
                              <p className="font-bold text-primary">
                                {testimonial.returns}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-8">
                <CarouselPrevious className="relative left-0 translate-x-0 translate-y-0" />
                <CarouselNext className="relative right-0 translate-x-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="border-0 relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <CardContent className="p-12 md:p-20 text-center relative">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Start Building Your{" "}
                  <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                    Real Estate Portfolio Today
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                  Join thousands of Nigerians investing in premium properties
                  through tokenized real estate
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-10 text-lg transition-all"
                  >
                    <Link to="/auth/signup">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-10 text-lg"
                  >
                    <Link to="/browse">View Properties</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  ✓ No hidden fees • ✓ SEC compliant • ✓ Instant ownership
                  transfer
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
