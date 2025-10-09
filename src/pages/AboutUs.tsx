import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Target, Eye, Heart, Users, TrendingUp, Shield, Award } from "lucide-react";
import { Link } from "react-router-dom";

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
      <section className="relative py-20 overflow-hidden border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">About PropChain</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Democratizing Real Estate Investment in Nigeria
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to make property ownership accessible to every Nigerian through fractional ownership and distributed ledger technology
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    To democratize access to real estate investment in Nigeria by breaking down traditional barriers through fractional ownership and innovative technology.
                  </p>
                  <p className="text-muted-foreground">
                    We believe every Nigerian deserves the opportunity to build wealth through property investment, regardless of their starting capital. By leveraging distributed ledger technology and regulatory compliance, we're creating a transparent, secure, and accessible investment platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    To become Africa's leading fractional real estate investment platform, empowering millions to build generational wealth through property ownership.
                  </p>
                  <p className="text-muted-foreground">
                    We envision a future where real estate investment is as simple as buying stocks, where transparency is guaranteed by technology, and where every Nigerian can participate in the country's property market growth with confidence and security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at PropChain
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey/Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-muted-foreground">
                Key milestones in our mission to transform Nigerian real estate investment
              </p>
            </div>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                        {milestone.year}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Regulated & Compliant</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    PropChain is registered and regulated by the Securities and Exchange Commission, Nigeria as a digital sub-broker. We operate in full compliance with Nigerian securities and property laws.
                  </p>
                  <p className="text-muted-foreground">
                    Our partnership with Lambeth Capital Limited, a registered broker-dealer with the Securities and Exchange Commission, Nigeria, ensures that all investments are processed through proper regulatory channels. We work with licensed property developers and conduct thorough due diligence on all listed properties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us in Building the Future</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of Nigeria's real estate revolution. Start your investment journey with PropChain today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth/signup">Start Investing</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
