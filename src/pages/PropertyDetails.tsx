import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import FavoriteButton from "@/components/FavoriteButton";
import {
  MapPin,
  Building,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  MessageCircle,
  Play,
  ArrowLeft,
  Share,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { Progress } from "@/components/ui/progress";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch real property and tokenization data
  const {
    data: propertyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property-details", id],
    queryFn: async () => {
      if (!id) throw new Error("Property ID is required");

      // Get tokenization data with property details
      const tokenization = await supabaseService.properties.getTokenizationById(
        id
      );
      if (!tokenization) throw new Error("Property not found");

      // Get the actual property data
      const property = await supabaseService.properties.getPropertyById(
        tokenization.property_id
      );
      if (!property) throw new Error("Property details not found");

      // Get property images
      const images = await supabaseService.properties.getPropertyImages(
        tokenization.property_id
      );

      return {
        tokenization,
        property,
        images:
          images.length > 0
            ? images.map((img) => img.image_url)
            : [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
              ],
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-background-muted py-6">
          <div className="container mx-auto mobile-padding">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="container mx-auto mobile-padding py-8">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !propertyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Property Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
            <Link to="/browse">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { tokenization, property, images } = propertyData;
  const progressPercentage =
    ((tokenization.tokens_sold || 0) / (tokenization.total_supply || 1)) * 100;

  const formatLocation = (location: any) => {
    if (typeof location === "string") return location;
    if (typeof location === "object" && location) {
      const parts = [location.city, location.state, location.country].filter(
        Boolean
      );
      return parts.join(", ") || "Location TBD";
    }
    return "Location TBD";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background-muted py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/browse">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              <FavoriteButton
                propertyId={property.id}
                variant="ghost"
                size="icon"
              />
              <Button variant="ghost" size="icon">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <img
                    src={images[0]}
                    alt={property.title || "Property Image"}
                    className="w-full h-64 md:h-80 object-cover rounded-xl"
                  />
                </div>
                {images.slice(1, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-32 md:h-40 object-cover rounded-lg"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Button
                          variant="secondary"
                          className="text-white text-sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          View All Photos
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4 mobile-flex gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {property.title || "Property Investment"}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="mobile-text">
                      {formatLocation(property.location)}
                    </span>
                  </div>
                </div>
                <Badge className="status-verified">
                  {tokenization.status === "active"
                    ? "Active"
                    : tokenization.status === "upcoming"
                    ? "Upcoming"
                    : tokenization.status === "completed"
                    ? "Completed"
                    : "Draft"}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-background-muted border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-primary mr-1" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Target Raise
                    </span>
                  </div>
                  <p className="text-sm md:text-lg font-bold text-foreground">
                    {formatCurrency(tokenization.target_raise || 0)}
                  </p>
                </div>

                <div className="bg-background-muted border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Expected ROI
                    </span>
                  </div>
                  <p className="text-sm md:text-lg font-bold text-success">
                    {tokenization.expected_roi_annual || 0}% p.a.
                  </p>
                </div>

                <div className="bg-background-muted border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Tokens Sold
                    </span>
                  </div>
                  <p className="text-sm md:text-lg font-bold text-foreground">
                    {(tokenization.tokens_sold || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-background-muted border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-warning mr-1" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Deadline
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {tokenization.investment_window_end
                      ? new Date(
                          tokenization.investment_window_end
                        ).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
              </div>

              {/* Investment Progress */}
              <div className="bg-background-muted border border-border rounded-lg p-4 md:p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground mobile-text">
                    Investment Progress
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {progressPercentage.toFixed(1)}% Complete
                  </span>
                </div>
                <Progress
                  value={Math.min(progressPercentage, 100)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs md:text-sm text-muted-foreground mt-3">
                  <span>
                    {(tokenization.tokens_sold || 0).toLocaleString()} tokens
                    sold
                  </span>
                  <span>
                    {(
                      (tokenization.total_supply || 0) -
                      (tokenization.tokens_sold || 0)
                    ).toLocaleString()}{" "}
                    remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                      Property Description
                    </h3>
                    <div className="text-muted-foreground space-y-4 mobile-text">
                      <p>
                        {property.description ||
                          "This is a premium real estate investment opportunity. Details about the property, its location, amenities, and investment potential will be provided here."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                      Investment Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-background-muted border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">
                          Minimum Investment
                        </h4>
                        <p className="text-lg font-semibold text-muted-foreground">
                          {formatCurrency(tokenization.min_investment || 0)}
                        </p>
                      </div>
                      <div className="bg-background-muted border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">
                          Price Per Token
                        </h4>
                        <p className="text-lg font-semibold text-muted-foreground">
                          {formatCurrency(tokenization.price_per_token || 0)}
                        </p>
                      </div>
                      <div className="bg-background-muted border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">
                          Total Supply
                        </h4>
                        <p className="text-lg font-semibold text-muted-foreground">
                          {(tokenization.total_supply || 0).toLocaleString()}{" "}
                          tokens
                        </p>
                      </div>
                      <div className="bg-background-muted border border-border rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">
                          Management Fee
                        </h4>
                        <p className="text-lg font-semibold text-muted-foreground">
                          {tokenization.management_fee_percentage || 2.5}%
                          annually
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financials" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-background-muted border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Current Raise
                    </h4>
                    <p className="text-lg font-semibold text-muted-foreground">
                      {formatCurrency(tokenization.current_raise || 0)}
                    </p>
                  </div>
                  <div className="bg-background-muted border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Target Raise
                    </h4>
                    <p className="text-lg font-semibold text-muted-foreground">
                      {formatCurrency(tokenization.target_raise || 0)}
                    </p>
                  </div>
                  <div className="bg-background-muted border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Property Value
                    </h4>
                    <p className="text-lg font-semibold text-muted-foreground">
                      {formatCurrency(property.estimated_value || 0)}
                    </p>
                  </div>
                  <div className="bg-background-muted border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">
                      Platform Fee
                    </h4>
                    <p className="text-lg font-semibold text-muted-foreground">
                      {tokenization.platform_fee_percentage || 1}% on investment
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-background-muted border border-border rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Documents Available
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Property documents will be available to investors upon
                      investment
                    </p>
                    <Button variant="outline">Request Access</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <div className="bg-background-muted border border-border rounded-lg p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Join the Discussion
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other investors and get answers to your
                    questions
                  </p>
                  <Button className="btn-primary">Join Chat Room</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Calculator */}
            <InvestmentCalculator
              propertyValue={tokenization.target_raise || 0}
              expectedReturn={tokenization.expected_roi_annual || 0}
              tokenPrice={tokenization.price_per_token || 0}
              minimumInvestment={tokenization.min_investment || 0}
              property={property}
            />

            {/* Quick Actions */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask a Question
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Tour
                </Button>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Similar Properties
              </h3>
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <div key={index} className="flex space-x-3 mobile-flex items-center border border-border rounded-lg p-4 cursor-pointer">
                    <img
                      src={`https://zjtqptljuggbymcoovey.supabase.co/storage/v1/object/public/property-images/placeholder.svg`}
                      alt="Similar property"
                      className="w-20 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        Commercial Plaza
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Victoria Island
                      </p>
                      <p className="text-sm font-semibold text-success">
                        15% ROI
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
