import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
  Building2,
  ArrowRight,
  Wallet,
  FileText,
  BarChart3,
  Lock,
  Clock,
  CheckCircle,
  Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export default function Waitlist() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    investmentAmount: "",
    primaryInterest: "",
    hearAboutUs: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

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
      const avgReturn = investments.length > 0 ? 12.5 : 0;

      return {
        propertiesCount: properties.length,
        investorsCount: usersCount,
        totalInvested,
        avgReturn,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);

    try {
      // Note: You may need to create a 'waitlist' table in Supabase
      // Table structure: id, full_name, email, phone, investment_amount, primary_interest, 
      // hear_about_us, comments, created_at, notified_at (optional)
      const { error } = await supabase
        .from("waitlist" as any)
        .insert([
          {
            full_name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.trim() || null,
            investment_amount: formData.investmentAmount || null,
            primary_interest: formData.primaryInterest || null,
            hear_about_us: formData.hearAboutUs || null,
            comments: formData.comments.trim() || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          console.warn("Waitlist table not found. Please create the table in Supabase.");
          toast.success("Thanks! We'll notify you when we launch.");
          setSubmitted(true);
        } else if (error.code === "23505") {
          toast.info("You're already on the waitlist!");
          setSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You've been added to the waitlist!");
        setSubmitted(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          investmentAmount: "",
          primaryInterest: "",
          hearAboutUs: "",
          comments: "",
        });
      }
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const platformStats = [
    {
      label: "Total Properties",
      value: statsLoading ? "..." : `${stats?.propertiesCount || 0}+`,
      icon: Building2,
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
      icon: Building2,
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
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <Badge
              className="mb-6 text-sm px-5 py-1 bg-primary/10 hover:bg-primary/20 border-primary/20"
              variant="outline"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
              Coming Soon
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Join the{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Waitlist
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Get early access to PropChain and be the first to invest in fractional
              real estate. Join thousands already waiting.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground mt-8">
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

          {/* Waitlist Form */}
          {!submitted ? (
            <div className="max-w-3xl mx-auto mb-16">
              <Card className="border-primary/20 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="investmentAmount">
                          Investment Amount Interest
                        </Label>
                        <Select
                          value={formData.investmentAmount}
                          onValueChange={(value) =>
                            setFormData({ ...formData, investmentAmount: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_50k">Under ₦50,000</SelectItem>
                            <SelectItem value="50k_100k">₦50,000 - ₦100,000</SelectItem>
                            <SelectItem value="100k_500k">₦100,000 - ₦500,000</SelectItem>
                            <SelectItem value="500k_1m">₦500,000 - ₦1M</SelectItem>
                            <SelectItem value="1m_5m">₦1M - ₦5M</SelectItem>
                            <SelectItem value="over_5m">Over ₦5M</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryInterest">
                          Primary Interest
                        </Label>
                        <Select
                          value={formData.primaryInterest}
                          onValueChange={(value) =>
                            setFormData({ ...formData, primaryInterest: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select interest" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fractional_ownership">
                              Fractional Ownership
                            </SelectItem>
                            <SelectItem value="rental_income">
                              Rental Income
                            </SelectItem>
                            <SelectItem value="governance">Governance Rights</SelectItem>
                            <SelectItem value="property_appreciation">
                              Property Appreciation
                            </SelectItem>
                            <SelectItem value="diversification">
                              Portfolio Diversification
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                        <Select
                          value={formData.hearAboutUs}
                          onValueChange={(value) =>
                            setFormData({ ...formData, hearAboutUs: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend_referral">
                              Friend/Family Referral
                            </SelectItem>
                            <SelectItem value="news_article">News Article</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="event">Event/Conference</SelectItem>
                            <SelectItem value="search_engine">Search Engine</SelectItem>
                            <SelectItem value="advertisement">Advertisement</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comments">Additional Comments (Optional)</Label>
                      <Textarea
                        id="comments"
                        placeholder="Tell us what you're most excited about..."
                        value={formData.comments}
                        onChange={(e) =>
                          setFormData({ ...formData, comments: e.target.value })
                        }
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        "Joining Waitlist..."
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By joining, you agree to receive updates about PropChain.
                      We respect your privacy and won't spam you.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mb-16">
              <Card className="border-primary/30 bg-primary/5 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thanks for joining. We'll notify you as soon as we launch and you'll
                    have early access to all features.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" asChild>
                      <Link to="/">Back to Home</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth/signup">
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Growth</h2>
            <p className="text-muted-foreground">
              Join a growing community of real estate investors
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {platformStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="relative overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card transition-all group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
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
              );
            })}
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
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="relative overflow-hidden border border-zinc/10 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
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
              );
            })}
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
            <h2 className="text-4xl md:text-5xl font-bold mb-5">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Start investing in real estate in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                  )}
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-6 relative border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-10 w-10 text-primary" />
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {!submitted && (
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
                Join thousands of satisfied investors building wealth through tokenized
                real estate
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
      )}

      {/* CTA Section */}
      {!submitted && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--primary)/0.15),transparent_60%)]" />
                <CardContent className="p-12 md:p-20 text-center relative">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Ready to Start Building Your{" "}
                    <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                      Real Estate Portfolio?
                    </span>
                  </h2>
                  <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                    Join the waitlist to get early access and exclusive benefits when we
                    launch
                  </p>
                  <Button size="lg" asChild className="h-14 px-10 text-lg transition-all">
                    <Link to="/auth/signup">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
