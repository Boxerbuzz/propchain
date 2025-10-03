import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePortfolioDetail } from "@/hooks/usePortfolioDetail";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  MapPin,
  MessageSquare,
  Send,
  Download,
  Share,
  AlertCircle,
  Vote,
  FileText
} from "lucide-react";

const PortfolioDetail = () => {
  const { tokenizationId } = useParams<{ tokenizationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  
  const { data, isLoading, error } = usePortfolioDetail(tokenizationId || '');

  const sendMessage = () => {
    if (message.trim() && data?.chatRoom) {
      // TODO: Implement chat message sending
      setMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Investment not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { tokenHolding, tokenization, property, dividendPayments, activityLogs, proposals, documents } = data;
  
  // Calculate investment metrics
  const totalInvested = tokenHolding.total_invested_ngn || 0;
  const currentValue = totalInvested + (tokenHolding.unrealized_returns_ngn || 0);
  const totalReturn = (tokenHolding.unrealized_returns_ngn || 0) + (tokenHolding.realized_returns_ngn || 0);
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const ownershipPercentage = tokenization.total_supply > 0 
    ? ((tokenHolding.balance / tokenization.total_supply) * 100).toFixed(3)
    : '0';

  // Get total dividends received
  const totalDividendsReceived = dividendPayments
    .filter(d => d.payment_status === 'paid')
    .reduce((sum, d) => sum + (d.amount_ngn || 0), 0);

  // Get primary property image
  const primaryImage = property.property_images?.find((img: any) => img.is_primary) 
    || property.property_images?.[0];

  // Calculate financial metrics
  const propertyValue = property.estimated_value || 0;
  const monthlyRent = property.rental_income_monthly || 0;
  const rentalYield = property.rental_yield || 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {property.location?.city}, {property.location?.state}
              </span>
              <Badge variant="secondary">{tokenization.status}</Badge>
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
              <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {tokenHolding.balance.toLocaleString()} tokens ({ownershipPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{currentValue.toLocaleString()}</div>
              <p className={`text-xs ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}₦{totalReturn.toLocaleString()} ({returnPercentage.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expected Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenization.expected_roi_annual}%</div>
              <p className="text-xs text-muted-foreground">Annual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalDividendsReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">In dividends</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Image */}
        {primaryImage && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <img 
                src={primaryImage.image_url} 
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

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
                      <p className="font-semibold">₦{propertyValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-semibold">₦{monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rental Yield</p>
                      <p className="font-semibold">{rentalYield}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-semibold">{property.property_type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLogs.length > 0 ? (
                    <div className="space-y-4">
                      {activityLogs.slice(0, 3).map((log: any) => (
                        <div key={log.id} className="border-l-2 border-primary pl-4">
                          <h4 className="font-medium">{log.activity_type.replace(/_/g, ' ').toUpperCase()}</h4>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.created_at), 'PPP')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent updates</p>
                  )}
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
                  {dividendPayments.length > 0 ? (
                    <div className="space-y-3">
                      {dividendPayments.map((dividend: any) => (
                        <div key={dividend.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">₦{(dividend.amount_ngn || 0).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(dividend.created_at), 'PPP')}
                            </p>
                          </div>
                          <Badge variant={dividend.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {dividend.payment_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No dividend payments yet</p>
                  )}
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
                      <p className="font-semibold">{tokenization.expected_roi_annual}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="font-semibold">{tokenization.total_supply.toLocaleString()} tokens</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens Sold</p>
                      <p className="font-semibold">{tokenization.tokens_sold.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Raised</p>
                      <p className="font-semibold">₦{(tokenization.current_raise || 0).toLocaleString()}</p>
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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Chat feature is coming soon. You'll be able to discuss with other investors here.
                  </AlertDescription>
                </Alert>
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
                {proposals.length > 0 ? (
                  <div className="space-y-6">
                    {proposals.map((proposal: any) => {
                      const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0);
                      const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
                      
                      return (
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
                              <span>For: {(proposal.votes_for || 0).toLocaleString()} tokens</span>
                              <span>Against: {(proposal.votes_against || 0).toLocaleString()} tokens</span>
                            </div>
                            <Progress value={forPercentage} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-muted-foreground">
                              Ends: {format(new Date(proposal.voting_end), 'PPP')}
                            </span>
                            {proposal.status === "active" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">Vote Against</Button>
                                <Button size="sm">Vote For</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active proposals</p>
                )}
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
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                 {doc.document_type.toUpperCase()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {doc.verification_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a title="Download Document" href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioDetail;