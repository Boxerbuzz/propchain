import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Bed,
  Bath,
  Calendar,
  DollarSign,
  ArrowLeft,
  Image,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  X,
  Home,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyView = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => supabaseService.properties.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Property not found or you don't have permission to view it.
            </p>
            <Link to="/property/management">
              <Button className="mt-4">Back to Management</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = property.property_images || [];
  const documents = property.property_documents || [];
  const primaryImage =
    images.find((img) => img.is_primary)?.image_url ||
    images[0]?.image_url ||
    "/placeholder.svg";

  const getDocumentIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case "title_deed":
        return <Home className="w-4 h-4" />;
      case "survey":
        return <MapPin className="w-4 h-4" />;
      case "valuation":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {(property.location as any)?.address},{" "}
              {(property.location as any)?.city},{" "}
              {(property.location as any)?.state}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Badge
              variant={
                property.approval_status === "approved"
                  ? "default"
                  : property.approval_status === "pending"
                  ? "secondary"
                  : "destructive"
              }
            >
              {property.approval_status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Property ID: {property.id.slice(0, 8)}...
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/property/management">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link to={`/property/${propertyId}/edit`}>
            <Button variant="outline">Edit Property</Button>
          </Link>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Hero Image */}
          <Card>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 10}>
                <img
                  src={primaryImage}
                  alt={property.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </AspectRatio>
            </CardContent>
          </Card>

          {/* Description */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Property Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Property Images ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No images uploaded yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <AspectRatio ratio={1}>
                        <img
                          src={image.image_url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setIsImageDialogOpen(true);
                          }}
                        />
                      </AspectRatio>
                      {image.is_primary && (
                        <Badge className="absolute top-2 left-2 bg-blue-500">
                          Primary
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Property Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No documents uploaded yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {getDocumentIcon(document.document_type)}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {document.document_name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">
                              {document.document_type.replace("_", " ")}
                            </span>
                            {document.file_size && (
                              <span>
                                • {Math.round(document.file_size / 1024)} KB
                              </span>
                            )}
                            <span>
                              • Uploaded{" "}
                              {new Date(
                                document.uploaded_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getVerificationStatusBadge(
                          document.verification_status
                        )}
                        <div className="flex gap-1 sm:gap-2">
                          {document.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="p-2 sm:px-3 sm:py-2"
                            >
                              <a
                                href={document.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </a>
                            </Button>
                          )}
                          {document.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="p-2 sm:px-3 sm:py-2"
                            >
                              <a href={document.file_url} download>
                                <Download className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Download
                                </span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tokenization Details */}
          {property.tokenizations && property.tokenizations.length > 0 ? (
            property.tokenizations.map((tokenization) => (
              <Card key={tokenization.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tokenization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline">{tokenization.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Token Symbol
                      </p>
                      <p className="font-semibold">
                        {tokenization.token_symbol || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Supply
                      </p>
                      <p className="font-semibold">
                        {tokenization.total_supply?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Price per Token
                      </p>
                      <p className="font-semibold">
                        ₦{tokenization.price_per_token?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Target Raise
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ₦{tokenization.target_raise?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Raise
                      </p>
                      <p className="text-lg font-semibold">
                        ₦{tokenization.current_raise?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Funding Progress
                      </p>
                      <div className="space-y-3">
                        {/* Circular Progress */}
                        <div className="flex items-center justify-center">
                          <div className="relative w-24 h-24">
                            <svg
                              className="w-24 h-24 transform -rotate-90"
                              viewBox="0 0 100 100"
                            >
                              {/* Background circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${
                                  2 *
                                  Math.PI *
                                  45 *
                                  (1 -
                                    tokenization.current_raise /
                                      tokenization.target_raise)
                                }`}
                                className="text-blue-600 transition-all duration-500 ease-out"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {(
                                    (tokenization.current_raise /
                                      tokenization.target_raise) *
                                    100
                                  ).toFixed(0)}
                                  %
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  funded
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                            <div className="text-sm font-semibold text-blue-600">
                              {tokenization.investor_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Investors
                            </div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                            <div className="text-sm font-semibold text-green-600">
                              ₦
                              {(tokenization.current_raise / 1000000).toFixed(
                                1
                              )}
                              M
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Raised
                            </div>
                          </div>
                        </div>

                        {/* Linear progress as backup */}
                        <div className="space-y-1">
                          <Progress
                            value={Math.min(
                              (tokenization.current_raise /
                                tokenization.target_raise) *
                                100,
                              100
                            )}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              ₦
                              {(tokenization.current_raise / 1000000).toFixed(
                                1
                              )}
                              M raised
                            </span>
                            <span>
                              ₦
                              {(tokenization.target_raise / 1000000).toFixed(1)}
                              M goal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tokenization.investment_window_start &&
                    tokenization.investment_window_end && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">
                          Investment Window
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p>
                              {new Date(
                                tokenization.investment_window_start
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p>
                              {new Date(
                                tokenization.investment_window_end
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Tokenization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  This property has not been tokenized yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Tokenization allows investors to purchase fractional ownership
                  of this property.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold capitalize">
                    {property.property_type}
                  </p>
                </div>
                {property.bedrooms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-semibold flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      {property.bedrooms}
                    </p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-semibold flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      {property.bathrooms}
                    </p>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {property.year_built}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Value
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ₦{property.estimated_value?.toLocaleString()}
                    </p>
                  </div>
                  {property.rental_income_monthly && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Monthly Rental Income
                      </p>
                      <p className="text-lg font-semibold">
                        ₦{property.rental_income_monthly?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Status */}
          <Card>
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Approval Status</span>
                {getVerificationStatusBadge(property.approval_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Listing Status</span>
                <Badge variant="outline">{property.listing_status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tokenization Summary */}
          {property.tokenizations && property.tokenizations.length > 0 ? (
            property.tokenizations.map((tokenization) => (
              <Card key={tokenization.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tokenization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline">{tokenization.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Token Symbol
                      </p>
                      <p className="font-semibold">
                        {tokenization.token_symbol || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Price per Token
                      </p>
                      <p className="font-semibold">
                        ₦{tokenization.price_per_token?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Target Raise
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₦{tokenization.target_raise?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Raise
                        </p>
                        <p className="text-lg font-semibold">
                          ₦{tokenization.current_raise?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Funding Progress
                        </p>
                        <div className="space-y-4">
                          {/* Enhanced Progress Display */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl font-bold text-blue-600">
                                {(
                                  (tokenization.current_raise /
                                    tokenization.target_raise) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {tokenization.investor_count} investors
                              </span>
                            </div>

                            {/* Enhanced Progress Bar */}
                            <div className="relative">
                              <Progress
                                value={Math.min(
                                  (tokenization.current_raise /
                                    tokenization.target_raise) *
                                    100,
                                  100
                                )}
                                className="h-3"
                              />

                              {/* Progress markers */}
                              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>₦0</span>
                                <span className="font-medium">
                                  ₦
                                  {(
                                    tokenization.current_raise / 1000000
                                  ).toFixed(1)}
                                  M raised
                                </span>
                                <span>
                                  ₦
                                  {(
                                    tokenization.target_raise / 1000000
                                  ).toFixed(1)}
                                  M goal
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-600">
                                ₦
                                {(tokenization.current_raise / 1000000).toFixed(
                                  1
                                )}
                                M
                              </div>
                              <div className="text-sm text-blue-600/70">
                                Raised
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-green-600">
                                ₦
                                {(
                                  (tokenization.target_raise -
                                    tokenization.current_raise) /
                                  1000000
                                ).toFixed(1)}
                                M
                              </div>
                              <div className="text-sm text-green-600/70">
                                Remaining
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tokenization.investment_window_start &&
                    tokenization.investment_window_end && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2 text-sm">
                          Investment Window
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">
                              {new Date(
                                tokenization.investment_window_start
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">
                              {new Date(
                                tokenization.investment_window_end
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Tokenization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Not tokenized yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Tokenization allows fractional ownership
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {images.length > 0 && (
            <div className="space-y-4">
              <AspectRatio ratio={16 / 10}>
                <img
                  src={images[selectedImageIndex]?.image_url}
                  alt={`Property image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Image {selectedImageIndex + 1} of {images.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                    }
                    disabled={selectedImageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedImageIndex(
                        Math.min(images.length - 1, selectedImageIndex + 1)
                      )
                    }
                    disabled={selectedImageIndex === images.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto">
                {images.map((image, index) => (
                  <AspectRatio key={image.id} ratio={1}>
                    <img
                      src={image.image_url}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-full h-full object-cover rounded cursor-pointer transition-opacity ${
                        index === selectedImageIndex
                          ? "ring-2 ring-blue-500"
                          : "hover:opacity-80"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </AspectRatio>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyView;
