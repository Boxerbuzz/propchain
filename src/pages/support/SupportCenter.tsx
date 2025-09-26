import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
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
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SupportCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
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
        }
      ]
    },
    {
      category: "Investing",
      questions: [
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
        }
      ]
    },
    {
      category: "Payments & Wallets",
      questions: [
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
        }
      ]
    },
    {
      category: "Security & Safety",
      questions: [
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
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      availability: "24/7",
      response: "Immediate"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      availability: "Always open",
      response: "Within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      availability: "Mon-Fri 9AM-6PM",
      response: "Immediate"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Investment Guide",
      description: "Complete guide to real estate tokenization",
      type: "PDF Guide",
      link: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step platform walkthrough",
      type: "Video Series",
      link: "#"
    },
    {
      icon: FileText,
      title: "Legal Documents",
      description: "Terms, privacy policy, and disclosures",
      type: "Legal",
      link: "#"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other investors",
      type: "Community",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto mobile-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Support Center</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get help with your PropChain account, investments, and platform features. 
              Find answers to common questions or contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="faq" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="contact">Contact Us</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
            </TabsList>

            {/* FAQ Section */}
            <TabsContent value="faq" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Find quick answers to the most common questions about PropChain
                </p>
              </div>

              {filteredFaqs.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse our categories below
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredFaqs.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Badge variant="secondary">{category.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ({category.questions.length} questions)
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {category.questions.map((faq) => (
                          <Card key={faq.id} className="transition-all hover:shadow-md">
                            <CardHeader 
                              className="cursor-pointer"
                              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            >
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-medium text-foreground">
                                  {faq.question}
                                </CardTitle>
                                {expandedFaq === faq.id ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </CardHeader>
                            {expandedFaq === faq.id && (
                              <CardContent className="pt-0">
                                <p className="text-muted-foreground">{faq.answer}</p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Contact Section */}
            <TabsContent value="contact" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Can't find what you're looking for? Our support team is here to help
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {contactOptions.map((option, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <option.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">{option.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {option.availability}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Response time: {option.response}
                        </p>
                      </div>
                      <Button className="w-full">{option.action}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Name *</label>
                        <Input placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Email *</label>
                        <Input type="email" placeholder="your.email@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Subject *</label>
                      <Input placeholder="What can we help you with?" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Message *</label>
                      <Textarea 
                        placeholder="Please describe your question or issue in detail..."
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="urgent" />
                      <label htmlFor="urgent" className="text-sm text-muted-foreground">
                        This is urgent and requires immediate attention
                      </label>
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Section */}
            <TabsContent value="resources" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Help Resources</h2>
                <p className="text-muted-foreground">
                  Explore our comprehensive resources to learn more about PropChain
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {resources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <resource.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">{resource.description}</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Badge variant="outline" className="mb-4">{resource.type}</Badge>
                      <Button variant="outline" className="w-full">Access Resource</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Popular Articles */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Help Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "How to make your first investment on PropChain",
                      "Understanding real estate tokenization risks",
                      "Setting up two-factor authentication",
                      "How to track your investment performance",
                      "Withdrawing funds from your PropChain wallet"
                    ].map((article, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{article}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Status Section */}
            <TabsContent value="status" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">System Status</h2>
                <p className="text-muted-foreground">
                  Current operational status of PropChain services
                </p>
              </div>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    All Systems Operational
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4">
                    All PropChain services are running normally. No known issues at this time.
                  </p>
                  <p className="text-sm text-green-600">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { service: "Website & Mobile App", status: "operational" },
                        { service: "User Authentication", status: "operational" },
                        { service: "Investment Processing", status: "operational" },
                        { service: "Wallet Services", status: "operational" },
                        { service: "KYC Verification", status: "operational" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-foreground">{item.service}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {item.status === "operational" ? "✓ Operational" : "⚠ Issues"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>External Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { service: "Hedera Network", status: "operational" },
                        { service: "Payment Processing", status: "operational" },
                        { service: "Email Delivery", status: "operational" },
                        { service: "SMS Notifications", status: "operational" },
                        { service: "Document Storage", status: "operational" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-foreground">{item.service}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {item.status === "operational" ? "✓ Operational" : "⚠ Issues"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No scheduled maintenance windows at this time. We'll notify users 
                    at least 24 hours in advance of any planned maintenance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}