import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Target,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Shield,
  Award,
  Sparkles,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Diamond,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useRef } from "react";

export default function AboutUs() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const stats = [
    { label: "Properties Listed", value: "50+", icon: Building2 },
    { label: "Active Investors", value: "10,000+", icon: Users },
    { label: "Total Investment", value: "₦2B+", icon: TrendingUp },
    { label: "Average Returns", value: "12-18%", icon: Award },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "We operate with full transparency, providing complete property details, legal documentation, and real-time investment tracking.",
    },
    {
      icon: Users,
      title: "Accessibility",
      description:
        "Making real estate investment accessible to everyone, regardless of their financial capacity, starting from just ₦10,000.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description:
        "Leveraging Hedera distributed ledger technology to provide secure, transparent, and efficient property tokenization.",
    },
    {
      icon: Heart,
      title: "Community First",
      description:
        "Building a community of investors who can grow their wealth together through democratic governance and shared success.",
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description:
        "PropChain was established with a mission to democratize real estate investment in Nigeria.",
    },
    {
      year: "2023",
      title: "SEC Registration",
      description:
        "Obtained regulatory approval from the Securities and Exchange Commission, Nigeria as a digital sub-broker.",
    },
    {
      year: "2024",
      title: "First Property Tokenized",
      description:
        "Successfully tokenized our first property, marking a milestone in Nigerian real estate innovation.",
    },
    {
      year: "2024",
      title: "10,000+ Investors",
      description:
        "Reached 10,000 active investors, demonstrating strong market confidence and adoption.",
    },
    {
      year: "2025",
      title: "₦2B+ Total Investment",
      description:
        "Surpassed ₦2 billion in total investments across our property portfolio.",
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge
                className="mb-6 text-sm bg-primary/10 hover:bg-primary/20 border-primary/20"
                variant="outline"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                About PropChain
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]">
                Democratizing Real Estate
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                  Investment in Nigeria
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Making property ownership accessible to every Nigerian through
                fractional ownership and cutting-edge distributed ledger
                technology
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 text-base transition-all"
                >
                  <Link to="/auth/signup">
                    Join PropChain
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 text-base"
                >
                  <Link to="/browse">Explore Properties</Link>
                </Button>
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
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-gray/10 bg-card/50 backdrop-blur-sm hover:bg-card transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent text-center">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                Our Purpose
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Driven by a vision to transform real estate investment in
                Nigeria
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border border-primary/20 transition-all duration-500 group relative overflow-hidden bg-gradient-to-br from-card to-card/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
                <CardContent className="p-12 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Target className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
                  <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                    To democratize access to real estate investment in Nigeria
                    by breaking down traditional barriers through fractional
                    ownership and innovative technology.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Accessible investment starting from ₦10,000
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Transparent, blockchain-backed transactions
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Fully regulated and compliant platform
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-primary/20 transition-all duration-500 group relative overflow-hidden bg-gradient-to-br from-card to-card/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 -translate-x-32 group-hover:scale-150 transition-transform duration-700" />
                <CardContent className="p-12 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Eye className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
                  <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                    To become Africa's leading fractional real estate investment
                    platform, empowering millions to build generational wealth
                    through property ownership.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Expand across African markets
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Empower millions of investors
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Set the standard for real estate innovation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <Badge
                className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                variant="outline"
              >
                <Diamond className="w-3 h-3 mr-2" />
                Core Values
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                What We Stand For
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                The principles that guide everything we do at PropChain
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border border-gray/10 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed text-center">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey/Timeline Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <Badge
                className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                variant="outline"
              >
                <Zap className="w-3.5 h-3.5 mr-2 inline" />
                Our Journey
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                Milestones That Matter
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Key moments in our mission to transform Nigerian real estate
                investment
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`flex items-center gap-8 ${
                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`flex-1 ml-12 md:ml-0 ${
                          index % 2 === 0
                            ? "md:text-right md:pr-12"
                            : "md:text-left md:pl-12"
                        }`}
                      >
                        <Card className="inline-block border transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/50">
                          <CardContent className="p-8 relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Badge className="mb-4 bg-primary text-primary-foreground font-bold text-lg px-4 py-1.5">
                              {milestone.year}
                            </Badge>
                            <h3 className="text-2xl font-bold mb-3">
                              {milestone.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="absolute left-4 md:left-1/2 top-1/2 transform -translate-y-1/2 md:-translate-x-1/2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-4 border-background">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            {/* Glowing wrapper */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              className="relative p-[2px] rounded-[20px] overflow-hidden group"
              style={{
                background: "transparent",
              }}
            >
              {/* Glow effect - uses ::before-like approach via a positioned div */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 1), transparent 80%)",
                }}
              />

              {/* Actual card content */}
              <Card className="relative z-10 border-0 overflow-hidden bg-gradient-to-br from-card via-card to-card/50 rounded-[18px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-48 -translate-x-48" />
                <CardContent className="p-12 md:p-20 relative">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-8">
                      <Shield className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <Badge
                      className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 text-sm"
                      variant="outline"
                    >
                      <ShieldCheck className="w-3 h-3 mr-2" />
                      Regulatory Compliance
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                      Regulated & Compliant
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                      PropChain is registered and regulated by the Securities
                      and Exchange Commission, Nigeria as a digital sub-broker.
                      We operate in full compliance with Nigerian securities and
                      property laws.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
                      <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold mb-2">SEC Registered</p>
                        <p className="text-sm text-muted-foreground">
                          Digital sub-broker license
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold mb-2">Partner Network</p>
                        <p className="text-sm text-muted-foreground">
                          Licensed broker-dealers
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold mb-2">Due Diligence</p>
                        <p className="text-sm text-muted-foreground">
                          Verified properties
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      Our partnership with Lambeth Capital Limited, a registered
                      broker-dealer with the Securities and Exchange Commission,
                      Nigeria, ensures that all investments are processed
                      through proper regulatory channels. We work with licensed
                      property developers and conduct thorough due diligence on
                      all listed properties.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-8">
                  <Globe className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Join Us in Building
                  <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                    The Future
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                  Be part of Nigeria's real estate revolution. Start your
                  investment journey with PropChain today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-10 text-lg transition-all"
                  >
                    <Link to="/auth/signup">
                      Start Investing
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-10 text-lg"
                  >
                    <Link to="/browse">Browse Properties</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
