import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  TrendingUp, 
  Building2, 
  Calendar, 
  MapPin,
  DollarSign,
  Users,
  MessageSquare,
  Send,
  Download,
  Share,
  AlertCircle,
  Vote
} from "lucide-react";

const PortfolioDetail = () => {
  const { tokenizationId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Mock detailed investment data
  const investment = {
    id: "inv-1",
    tokenizationId: "tok-luxury-manhattan",
    propertyTitle: "Luxury Downtown Apartment Complex",
    location: "Manhattan, NY",
    invested: 5000,
    currentValue: 5470,
    return: 470,
    returnPercentage: 9.4,
    tokens: 50,
    totalTokens: 25000,
    ownershipPercentage: 0.2,
    status: "active",
    expectedReturn: "8.5%",
    nextDividend: "2024-10-15",
    dividendAmount: 42.5,
    imageUrl: "/placeholder.svg",
    propertyValue: "$2,500,000",
    purchaseDate: "2024-01-15",
    lastDividend: "2024-09-15",
    lastDividendAmount: 40.0,
    totalDividendsReceived: 240.0,
    monthlyRent: "$125,000",
    occupancyRate: "95%",
    expenses: "$45,000",
    netIncome: "$80,000"
  };

  const dividendHistory = [
    { date: "2024-09-15", amount: 40.0, status: "paid" },
    { date: "2024-08-15", amount: 38.5, status: "paid" },
    { date: "2024-07-15", amount: 41.2, status: "paid" },
    { date: "2024-06-15", amount: 39.8, status: "paid" },
    { date: "2024-05-15", amount: 42.1, status: "paid" },
    { date: "2024-04-15", amount: 38.4, status: "paid" }
  ];

  const propertyUpdates = [
    {
      id: 1,
      date: "2024-09-20",
      title: "Q3 Performance Report",
      content: "Occupancy rate increased to 95%, generating strong rental income.",
      type: "report"
    },
    {
      id: 2,
      date: "2024-09-10",
      title: "Property Maintenance Complete",
      content: "HVAC system upgrade completed, improving energy efficiency by 15%.",
      type: "maintenance"
    },
    {
      id: 3,
      date: "2024-08-25",
      title: "New Tenant Signed",
      content: "Penthouse unit leased for 3 years at premium rate.",
      type: "leasing"
    }
  ];

  const discussions = [
    {
      id: 1,
      user: "Sarah Chen",
      avatar: "/placeholder.svg",
      message: "Great performance this quarter! The HVAC upgrade was a smart investment.",
      timestamp: "2 hours ago",
      tokens: 150
    },
    {
      id: 2,
      user: "Mike Rodriguez",
      avatar: "/placeholder.svg",
      message: "Any plans for the rooftop space? Could be a great amenity addition.",
      timestamp: "5 hours ago",
      tokens: 75
    },
    {
      id: 3,
      user: "Property Manager",
      avatar: "/placeholder.svg",
      message: "Monthly maintenance report is now available in the documents section.",
      timestamp: "1 day ago",
      tokens: 0,
      isOfficial: true
    }
  ];

  const governance = [
    {
      id: 1,
      title: "Rooftop Garden Installation",
      description: "Proposal to install a rooftop garden and lounge area for tenants",
      votes: { for: 18540, against: 2460 },
      totalTokens: 25000,
      status: "active",
      endDate: "2024-10-30"
    },
    {
      id: 2,
      title: "Solar Panel Installation",
      description: "Install solar panels to reduce energy costs and increase sustainability",
      votes: { for: 22100, against: 1200 },
      totalTokens: 25000,
      status: "passed",
      endDate: "2024-09-15"
    }
  ];

  const sendMessage = () => {
    if (message.trim()) {
      // In real app, send message to discussion
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{investment.propertyTitle}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{investment.location}</span>
              <Badge variant="secondary">{investment.status}</Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${investment.invested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{investment.tokens} tokens ({investment.ownershipPercentage}%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${investment.currentValue.toLocaleString()}</div>
              <p className="text-xs text-green-600">
                +${investment.return} ({investment.returnPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next Dividend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${investment.dividendAmount}</div>
              <p className="text-xs text-muted-foreground">{investment.nextDividend}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${investment.totalDividendsReceived}</div>
              <p className="text-xs text-muted-foreground">In dividends</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Image */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <img 
              src={investment.imageUrl} 
              alt={investment.propertyTitle}
              className="w-full h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Value</p>
                      <p className="font-semibold">{investment.propertyValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-semibold">{investment.monthlyRent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                      <p className="font-semibold">{investment.occupancyRate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                      <p className="font-semibold">{investment.netIncome}/month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyUpdates.slice(0, 3).map((update) => (
                      <div key={update.id} className="border-l-2 border-primary pl-4">
                        <h4 className="font-medium">{update.title}</h4>
                        <p className="text-sm text-muted-foreground">{update.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dividend History</CardTitle>
                  <CardDescription>Your dividend payments over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dividendHistory.map((dividend, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">${dividend.amount}</p>
                          <p className="text-sm text-muted-foreground">{dividend.date}</p>
                        </div>
                        <Badge variant="secondary">{dividend.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Yield</p>
                      <p className="font-semibold">{investment.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                      <p className="font-semibold">{investment.expenses}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="font-semibold">6.8%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NOI</p>
                      <p className="font-semibold">{investment.netIncome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discussion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Discussion
                </CardTitle>
                <CardDescription>Connect with other investors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={discussion.avatar} />
                        <AvatarFallback>{discussion.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{discussion.user}</span>
                          {discussion.tokens > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {discussion.tokens} tokens
                            </Badge>
                          )}
                          {discussion.isOfficial && (
                            <Badge variant="default" className="text-xs">Official</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{discussion.timestamp}</span>
                        </div>
                        <p className="text-sm">{discussion.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder="Share your thoughts with the community..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Property Governance
                </CardTitle>
                <CardDescription>Vote on important property decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {governance.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{proposal.title}</h4>
                          <p className="text-sm text-muted-foreground">{proposal.description}</p>
                        </div>
                        <Badge variant={proposal.status === "active" ? "default" : "secondary"}>
                          {proposal.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>For: {proposal.votes.for.toLocaleString()} tokens</span>
                          <span>Against: {proposal.votes.against.toLocaleString()} tokens</span>
                        </div>
                        <Progress 
                          value={(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-muted-foreground">
                          Ends: {proposal.endDate}
                        </span>
                        {proposal.status === "active" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Vote Against</Button>
                            <Button size="sm">Vote For</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
                <CardDescription>Access important property documents and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Q3 2024 Performance Report", type: "PDF", size: "2.4 MB", date: "2024-09-20" },
                    { name: "Property Insurance Policy", type: "PDF", size: "1.8 MB", date: "2024-01-15" },
                    { name: "Lease Agreements", type: "PDF", size: "3.2 MB", date: "2024-08-10" },
                    { name: "Maintenance Records", type: "PDF", size: "1.1 MB", date: "2024-09-15" },
                    { name: "Property Appraisal", type: "PDF", size: "4.6 MB", date: "2024-01-10" }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 text-xs font-medium">PDF</span>
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioDetail;