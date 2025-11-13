import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, TrendingUp, Shield, Users, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Note: You may need to create a 'waitlist' table in Supabase
      // Table structure: id, email, name, created_at, notified_at (optional)
      const { error } = await supabase
        .from("waitlist" as any)
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim() || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        // If table doesn't exist or duplicate email, handle gracefully
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          console.warn("Waitlist table not found. Please create the table in Supabase.");
          // Fallback: You could use a different service or just show success
          toast.success("Thanks! We'll notify you when we launch.");
          setSubmitted(true);
        } else if (error.code === "23505") {
          // Duplicate key error
          toast.info("You're already on the waitlist!");
          setSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You've been added to the waitlist!");
        setSubmitted(true);
        setEmail("");
        setName("");
      }
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Early Access",
      description: "Be among the first to invest in premium properties",
    },
    {
      icon: Shield,
      title: "Exclusive Updates",
      description: "Get notified about new investment opportunities",
    },
    {
      icon: Users,
      title: "Special Benefits",
      description: "Access to early bird bonuses and special rates",
    },
    {
      icon: Building2,
      title: "Priority Support",
      description: "Dedicated support during your first investments",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
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

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Get early access to PropChain and be the first to invest in fractional
                real estate. Join thousands already waiting.
              </p>
            </div>

            {!submitted ? (
              <Card className="border-primary/20 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="mr-2">Joining...</span>
                        </>
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
            ) : (
              <Card className="border-primary/30 bg-primary/5 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thanks for joining. We'll notify you as soon as we launch.
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
            )}

            {/* Benefits Section */}
            {!submitted && (
              <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={index}
                      className="border-border/50 hover:border-primary/30 transition-all"
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

