import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Search,
  Book,
  Video,
  FileText,
  Users,
  ChevronDown,
  CheckCircle,
  Sparkles,
  UserCheck,
  Wallet,
  Building2,
  Shield
} from "lucide-react";
import Footer from "@/components/Footer";

export default function SupportCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allFaqs = [
    {
      id: 1,
      question: "How do I create a PropChain account?",
      answer: "To create a PropChain account, click 'Sign Up' on our homepage, provide your email and personal details, complete the KYC verification process, and verify your email address. The entire process typically takes 5-10 minutes."
    },
    {
      id: 2,
      question: "What is KYC and why is it required?",
      answer: "KYC (Know Your Customer) is a regulatory requirement that helps us verify your identity and comply with anti-money laundering laws. You'll need to provide a government-issued ID, proof of address, and take a selfie verification."
    },
    {
      id: 3,
      question: "What documents do I need for verification?",
      answer: "You'll need: (1) A valid government-issued photo ID (National ID, Driver's License, or International Passport), (2) Proof of address (utility bill or bank statement from the last 3 months), and (3) A clear selfie for biometric verification."
    },
    {
      id: 4,
      question: "What is real estate tokenization?",
      answer: "Real estate tokenization converts property ownership into digital tokens on the blockchain. Each token represents a fractional share of the property, allowing you to invest in real estate with smaller amounts and potentially earn rental income dividends."
    },
    {
      id: 5,
      question: "What is the minimum investment amount?",
      answer: "The minimum investment varies by property, typically starting from ₦50,000. Each property listing shows the specific minimum and maximum investment amounts, along with the price per token."
    },
    {
      id: 6,
      question: "How do I receive rental income?",
      answer: "Rental income is distributed as dividends to token holders proportional to their ownership percentage. Dividends are typically paid quarterly and deposited directly to your PropChain wallet in Nigerian Naira."
    },
    {
      id: 7,
      question: "Can I sell my tokens?",
      answer: "Token liquidity depends on market conditions and the specific property. While tokens are built on blockchain technology to enable trading, there may not always be active buyers. Some properties may have lock-up periods."
    },
    {
      id: 8,
      question: "What payment methods are accepted?",
      answer: "We accept bank transfers, debit cards, and mobile money payments. All payments are processed in Nigerian Naira. International payments may be available for qualified investors."
    },
    {
      id: 9,
      question: "How does the PropChain wallet work?",
      answer: "Your PropChain wallet holds your tokens and Nigerian Naira balance. It's connected to the Hedera blockchain network where your property tokens are stored. You can fund your wallet, view your holdings, and track investment performance."
    },
    {
      id: 10,
      question: "Are there any fees?",
      answer: "PropChain charges a 1% platform fee on investments and up to 2.5% annual management fee on properties. Property management fees cover maintenance, insurance, and administration costs. All fees are clearly disclosed before investment."
    },
    {
      id: 11,
      question: "How secure is PropChain?",
      answer: "PropChain uses bank-level security including 256-bit SSL encryption, two-factor authentication, cold storage for digital assets, regular security audits, and compliance with Nigerian financial regulations."
    },
    {
      id: 12,
      question: "What if I lose access to my account?",
      answer: "If you lose access to your account, contact our support team immediately. We have account recovery procedures that include identity verification. For wallet recovery, you may need your backup phrase if applicable."
    },
    {
      id: 13,
      question: "Is my investment protected?",
      answer: "While investments carry inherent risks, PropChain implements several protections: regulatory compliance, property insurance, legal ownership structures, due diligence on properties, and segregated client funds."
    }
  ];

  const filteredFaqs = allFaqs.filter(
    q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      availability: "24/7",
      response: "Immediate",
      color: "from-blue-500/20 to-blue-500/5"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      availability: "Always open",
      response: "Within 24 hours",
      color: "from-green-500/20 to-green-500/5"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      availability: "Mon-Fri 9AM-6PM",
      response: "Immediate",
      color: "from-purple-500/20 to-purple-500/5"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Investment Guide",
      description: "Complete guide to real estate tokenization",
      type: "PDF Guide",
      link: "#",
      color: "from-orange-500/20 to-orange-500/5"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step platform walkthrough",
      type: "Video Series",
      link: "#",
      color: "from-pink-500/20 to-pink-500/5"
    },
    {
      icon: FileText,
      title: "Legal Documents",
      description: "Terms, privacy policy, and disclosures",
      type: "Legal",
      link: "#",
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other investors",
      type: "Community",
      link: "#",
      color: "from-blue-500/20 to-blue-500/5"
    }
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
              className="mb-6 text-sm px-5 py-1 bg-primary/10 hover:bg-primary/20 border-primary/20"
              variant="outline"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-2 inline" />
              Support Center
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]">
              How Can We{" "}
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                Help You Today?
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light mb-8">
              Get help with your PropChain account, investments, and platform features
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-base bg-card shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge
                className="mb-4 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                variant="outline"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Quick Answers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse our most common questions or use the search above
              </p>
            </div>

            {filteredFaqs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <Card 
                    key={faq.id} 
                    className="transition-all hover:shadow-md border border-border/50 group"
                  >
                    <CardHeader 
                      className="cursor-pointer p-6"
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-foreground pr-4">
                          {faq.question}
                        </CardTitle>
                        <ChevronDown 
                          className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                            expandedFaq === faq.id ? 'transform rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </CardHeader>
                    {expandedFaq === faq.id && (
                      <CardContent className="pt-0 px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactOptions.map((option, index) => (
                <Card key={index} className="relative overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <option.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-center">{option.title}</h3>
                    <p className="text-muted-foreground text-sm text-center mb-4">{option.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {option.availability}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Response: {option.response}
                      </p>
                    </div>
                    <Button className="w-full">{option.action}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Name *</label>
                      <Input placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                      <Input type="email" placeholder="your.email@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Subject *</label>
                    <Input placeholder="What can we help you with?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message *</label>
                    <Textarea 
                      placeholder="Please describe your question or issue in detail..."
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full md:w-auto px-8">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Help Resources</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive resources to learn more about PropChain
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="relative overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 relative text-center">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <resource.icon className="w-8 h-8 text-primary" />
                    </div>
                    <Badge variant="outline" className="mb-3 text-xs">{resource.type}</Badge>
                    <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm" className="w-full">Access</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
