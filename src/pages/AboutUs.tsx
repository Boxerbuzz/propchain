import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Target, Eye, Heart, Users, TrendingUp, Shield, Award, Sparkles, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function AboutUs() {
  const stats = [
    { label: "Properties Listed", value: "50+", icon: Building2 },
    { label: "Active Investors", value: "10,000+", icon: Users },
    { label: "Total Investment", value: "₦2B+", icon: TrendingUp },
    { label: "Average Returns", value: "12-18%", icon: Award }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We operate with full transparency, providing complete property details, legal documentation, and real-time investment tracking."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making real estate investment accessible to everyone, regardless of their financial capacity, starting from just ₦10,000."
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Leveraging Hedera distributed ledger technology to provide secure, transparent, and efficient property tokenization."
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Building a community of investors who can grow their wealth together through democratic governance and shared success."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "PropChain was established with a mission to democratize real estate investment in Nigeria."
    },
    {
      year: "2023",
      title: "SEC Registration",
      description: "Obtained regulatory approval from the Securities and Exchange Commission, Nigeria as a digital sub-broker."
    },
    {
      year: "2024",
      title: "First Property Tokenized",
      description: "Successfully tokenized our first property, marking a milestone in Nigerian real estate innovation."
    },
    {
      year: "2024",
      title: "10,000+ Investors",
      description: "Reached 10,000 active investors, demonstrating strong market confidence and adoption."
    },
    {
      year: "2025",
      title: "₦2B+ Total Investment",
      description: "Surpassed ₦2 billion in total investments across our property portfolio."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 text-sm px-4 py-1.5" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1.5 inline" />
              About PropChain
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
              Democratizing Real Estate Investment in Nigeria
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make property ownership accessible to every Nigerian through fractional ownership and cutting-edge distributed ledger technology
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="shadow-lg">
                <Link to="/auth/signup">Join PropChain</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/browse">Explore Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/20 transition-all hover:shadow-lg group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
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
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Purpose</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Driven by a vision to transform real estate investment in Nigeria
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    To democratize access to real estate investment in Nigeria by breaking down traditional barriers through fractional ownership and innovative technology.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe every Nigerian deserves the opportunity to build wealth through property investment, regardless of their starting capital. By leveraging distributed ledger technology and regulatory compliance, we're creating a transparent, secure, and accessible investment platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Eye className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    To become Africa's leading fractional real estate investment platform, empowering millions to build generational wealth through property ownership.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We envision a future where real estate investment is as simple as buying stocks, where transparency is guaranteed by technology, and where every Nigerian can participate in the country's property market growth with confidence and security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">Core Values</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">What We Stand For</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at PropChain
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all border-2 hover:border-primary/20 group">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
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
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                <Zap className="w-3 h-3 mr-1.5 inline" />
                Our Journey
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Milestones That Matter</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Key moments in our mission to transform Nigerian real estate investment
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative ${index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2'}`}>
                    <Card className="hover:shadow-xl transition-all border-2 hover:border-primary/20 ml-8 md:ml-0">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <Badge variant="default" className="text-lg font-bold px-5 py-2.5 bg-primary shadow-lg">
                            {milestone.year}
                          </Badge>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-3">{milestone.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="absolute left-0 md:left-1/2 top-1/2 transform -translate-y-1/2 md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
              <CardContent className="p-10 md:p-16 relative">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Shield className="w-12 h-12 text-primary" />
                  </div>
                  <Badge className="mb-6" variant="secondary">Regulatory Compliance</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Regulated & Compliant</h2>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                    PropChain is registered and regulated by the Securities and Exchange Commission, Nigeria as a digital sub-broker. We operate in full compliance with Nigerian securities and property laws.
                  </p>
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Our partnership with Lambeth Capital Limited, a registered broker-dealer with the Securities and Exchange Commission, Nigeria, ensures that all investments are processed through proper regulatory channels. We work with licensed property developers and conduct thorough due diligence on all listed properties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-2xl">
              <CardContent className="p-12 md:p-16 text-center">
                <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Join Us in Building the Future</h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Be part of Nigeria's real estate revolution. Start your investment journey with PropChain today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="shadow-lg">
                    <Link to="/auth/signup">Start Investing</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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
