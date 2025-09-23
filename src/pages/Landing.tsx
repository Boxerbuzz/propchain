import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { ArrowRight, Building, Users, TrendingUp, Shield, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  // Mock data for featured properties
  const featuredProperties = [
    {
      id: "1",
      title: "Luxury Apartment Complex - Ikoyi",
      location: "Ikoyi, Lagos",
      price: 500000000,
      expectedReturn: 12,
      tokensSold: 750,
      totalTokens: 1000,
      investmentDeadline: "Dec 31, 2024",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      status: "active" as const
    },
    {
      id: "2", 
      title: "Commercial Plaza - Victoria Island",
      location: "Victoria Island, Lagos",
      price: 750000000,
      expectedReturn: 15,
      tokensSold: 600,
      totalTokens: 1200,
      investmentDeadline: "Jan 15, 2025",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      status: "active" as const
    },
    {
      id: "3",
      title: "Residential Estate - Lekki", 
      location: "Lekki, Lagos",
      price: 300000000,
      expectedReturn: 10,
      tokensSold: 400,
      totalTokens: 800,
      investmentDeadline: "Feb 28, 2025",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      status: "upcoming" as const
    }
  ];

  const stats = [
    { label: "Total Properties", value: "150+", icon: Building },
    { label: "Active Investors", value: "5,000+", icon: Users },
    { label: "Total Invested", value: "₦2.5B", icon: TrendingUp },
    { label: "Average Returns", value: "12.5%", icon: Shield }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Regulated",
      description: "Built on Hedera Hashgraph with full regulatory compliance and investor protection."
    },
    {
      icon: Zap,
      title: "Instant Trading",
      description: "Buy and sell property tokens instantly with transparent pricing and low fees."
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Invest in premium Nigerian real estate from anywhere in the world."
    }
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
              <span className="text-primary block">Through Blockchain Tokens</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PropChain makes premium real estate accessible to everyone. Own fractions of high-value properties, 
              earn rental income, and trade your ownership tokens on our secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/browse">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Investment Opportunities
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover high-yield real estate investments carefully selected by our team
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/browse">
              <Button size="lg" variant="outline">
                View All Properties
                <ArrowRight className="ml-2 h-5 w-5" />
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
              <div key={index} className="bg-background border border-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
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
              Join thousands of investors who are already building wealth through tokenized real estate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
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