import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { usePortfolioDetail } from "@/hooks/usePortfolioDetail";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Download,
  Share,
  AlertCircle,
  Vote,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import InvestmentDocumentCard from "@/components/InvestmentDocumentCard";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";

const PortfolioDetail = () => {
  const { tokenizationId } = useParams<{ tokenizationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const { data, isLoading, error } = usePortfolioDetail(tokenizationId || "");

  // Fetch investment documents
  const { data: investmentDocuments } = useQuery({
    queryKey: ['investment-documents', tokenizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_documents' as any)
        .select('*')
        .eq('tokenization_id', tokenizationId)
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!tokenizationId,
  });

  const handlePreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/portfolio")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Investment not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const {
    tokenHolding,
    tokenization,
    property,
    dividendPayments,
    activityLogs,
    proposals,
    documents,
    chatRoom,
  } = data;

  // Calculate investment metrics
  const totalInvested = tokenHolding.total_invested_ngn || 0;
  const currentValue =
    totalInvested + (tokenHolding.unrealized_returns_ngn || 0);
  const totalReturn =
    (tokenHolding.unrealized_returns_ngn || 0) +
    (tokenHolding.realized_returns_ngn || 0);
  const returnPercentage =
    totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const ownershipPercentage =
    tokenization.total_supply > 0
      ? ((tokenHolding.balance / tokenization.total_supply) * 100).toFixed(3)
      : "0";

  // Get total dividends received
  const totalDividendsReceived = dividendPayments
    .filter((d) => d.payment_status === "paid")
    .reduce((sum, d) => sum + (d.amount_ngn || 0), 0);

  // Get primary property image
  const primaryImage =
    property.property_images?.find((img: any) => img.is_primary) ||
    property.property_images?.[0];

  // Calculate financial metrics
  const propertyValue = property.estimated_value || 0;
  const monthlyRent = property.rental_income_monthly || 0;
  const rentalYield = property.rental_yield || 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/portfolio")}
            className="border-2 border-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Button>
          <div className="flex gap-3">
            {chatRoom && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/chat/${chatRoom.id}`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            )}
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
        <div className="flex items-center gap-4 mb-8">
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
        </div>

        {/* Investment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Your Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {tokenHolding.balance.toLocaleString()} tokens (
                {ownershipPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{currentValue.toLocaleString()}
              </div>
              <p
                className={`text-xs ${
                  totalReturn >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalReturn >= 0 ? "+" : ""}₦{totalReturn.toLocaleString()} (
                {returnPercentage.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expected Yield
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tokenization.expected_roi_annual}%
              </div>
              <p className="text-xs text-muted-foreground">Annual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{totalDividendsReceived.toLocaleString()}
              </div>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Governance</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Investment Documents Section */}
            {investmentDocuments && investmentDocuments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Documents</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {investmentDocuments.map((doc) => (
                    <InvestmentDocumentCard
                      key={doc.id}
                      document={doc}
                      onPreview={(url) => handlePreview(url, doc.document_type === 'agreement' ? 'Investment Agreement' : 'Investment Receipt')}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Property Performance & Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Property Value
                      </p>
                      <p className="font-semibold text-lg">
                        ₦{propertyValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Monthly Rent
                      </p>
                      <p className="font-semibold text-lg">
                        ₦{monthlyRent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Rental Yield
                      </p>
                      <p className="font-semibold text-lg text-green-600">{rentalYield}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Property Type
                      </p>
                      <p className="font-semibold">{property.property_type}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Tokens Sold</span>
                      <span className="font-semibold">
                        {tokenization.tokens_sold.toLocaleString()} / {tokenization.total_supply.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(tokenization.tokens_sold / tokenization.total_supply) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dividend History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Dividends</CardTitle>
                  <CardDescription>
                    Your dividend payment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dividendPayments.length > 0 ? (
                    <div className="space-y-3">
                      {dividendPayments.slice(0, 5).map((dividend: any) => (
                        <div
                          key={dividend.id}
                          className="flex justify-between items-center py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              ₦{(dividend.amount_ngn || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(dividend.created_at), "PPP")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              dividend.payment_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {dividend.payment_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No dividends received yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Property Governance
                </CardTitle>
                <CardDescription>
                  Vote on important property decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {proposals.length > 0 ? (
                  <div className="space-y-6">
                    {proposals.map((proposal: any) => {
                      const totalVotes =
                        (proposal.votes_for || 0) +
                        (proposal.votes_against || 0);
                      const forPercentage =
                        totalVotes > 0
                          ? (proposal.votes_for / totalVotes) * 100
                          : 0;

                      return (
                        <div
                          key={proposal.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{proposal.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {proposal.description}
                              </p>
                            </div>
                            <Badge
                              variant={
                                proposal.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {proposal.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>For: {proposal.votes_for || 0}</span>
                              <span>Against: {proposal.votes_against || 0}</span>
                            </div>
                            <Progress value={forPercentage} className="h-2" />
                          </div>

                          {proposal.status === "active" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                Vote For
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                              >
                                Vote Against
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No active proposals
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {/* Investment Documents */}
            {investmentDocuments && investmentDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Documents</CardTitle>
                  <CardDescription>Your investment agreements and receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {investmentDocuments.map((doc) => (
                      <InvestmentDocumentCard
                        key={doc.id}
                        document={doc}
                        onPreview={(url) => handlePreview(url, doc.document_type === 'agreement' ? 'Investment Agreement' : 'Investment Receipt')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
                <CardDescription>
                  Legal and compliance documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.document_type} •{" "}
                              {format(new Date(doc.uploaded_at), "PPP")}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No property documents available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Property updates and events</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length > 0 ? (
                  <div className="space-y-4">
                    {activityLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="border-l-2 border-primary pl-4 py-2"
                      >
                        <h4 className="font-medium">
                          {log.activity_type.replace(/_/g, " ").toUpperCase()}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.created_at), "PPP")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
        documentUrl={previewUrl || ""}
        documentTitle={previewTitle}
      />
    </div>
  );
};

export default PortfolioDetail;
