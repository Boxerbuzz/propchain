import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  BarChart3,
  Wrench,
  AlertTriangle,
  MoreHorizontal,
  Check,
  Pause,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  useUserProperties,
  useUpdateProperty,
} from "@/hooks/usePropertyManagement";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { VaultMigrationButton } from "@/components/VaultMigrationButton";

const PropertyManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    action: "",
    propertyId: "",
    variant: "default" as "default" | "destructive",
  });

  const {
    data: managedProperties = [],
    isLoading,
    refetch,
  } = useUserProperties();
  const updatePropertyMutation = useUpdateProperty();

  // Financial summary - connect to real DB when available
  const financialSummary = {
    totalRevenue: 0,
    netProfit: 0,
    occupancyRate: 0,
    totalInvestors: 0,
  };

  // No maintenance requests - this feature needs to be implemented with proper DB tables

  const recentActivity = useMemo(
    () => [
      {
        type: "property",
        message: `New property registration completed`,
        property: managedProperties[0]?.title || "Property",
        timestamp: "2 hours ago",
      },
      {
        type: "maintenance",
        message: "System maintenance scheduled for next week",
        property: "System",
        timestamp: "5 hours ago",
      },
      {
        type: "investment",
        message: "Investment activity updated",
        property: managedProperties[1]?.title || "Property",
        timestamp: "1 day ago",
      },
    ],
    [managedProperties]
  );

  // Get dropdown-only actions (excluding actions already available as main buttons)
  const getDropdownActions = (property: any) => {
    const actions = [];

    // Status-specific actions (not available as main buttons)
    if (property.approval_status === "pending") {
      // Check if property has at least one document before allowing approval
      const hasDocuments =
        property.property_documents && property.property_documents.length > 0;

      actions.push({
        label: hasDocuments
          ? "Approve Property"
          : "Approve Property (No Documents)",
        action: "Approve",
        icon: Check,
        variant: hasDocuments ? "success" : "secondary",
        disabled: !hasDocuments,
      });
    }

    if (
      property.approval_status === "approved" &&
      property.listing_status === "active"
    ) {
      actions.push({
        label: "Delist Property",
        action: "Delist",
        icon: Pause,
        variant: "warning",
      });

      // Only show tokenize if not already tokenized
      if (!property.tokenizations || property.tokenizations.length === 0) {
        actions.push({
          label: "Tokenize Property",
          action: "Tokenize",
          icon: DollarSign,
          variant: "primary",
        });
      } else {
        // Check if there's a tokenization that needs approval
        const hasUnapprovedToken = property.tokenizations.some(
          (token: any) => token.status === "pending" || token.status === "draft"
        );
        if (hasUnapprovedToken) {
          actions.push({
            label: "Approve Token",
            action: "ApproveToken",
            icon: Check,
            variant: "success",
          });
        }
      }
    }

    if (
      property.approval_status === "suspended" ||
      property.listing_status === "suspended"
    ) {
      actions.push({
        label: "Relist Property",
        action: "Reactivate",
        icon: Check,
        variant: "success",
      });
    }

    // Destructive actions (always at the end)
    if (property.listing_status !== "deleted") {
      actions.push({
        label: "Delete Property",
        action: "Delete",
        icon: Trash2,
        variant: "destructive",
      });
    }

    return actions;
  };

  const showConfirmDialog = (
    action: string,
    propertyId: string,
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      propertyId,
      variant,
    });
  };

  const handleConfirmedAction = async () => {
    const { action, propertyId } = confirmDialog;

    switch (action) {
      case "Approve":
        // Show immediate notification that verification is in progress
        toast({
          title: "Property Verification Started",
          description:
            "Your property verification is being processed. This may take a few moments while we upload documents to the blockchain.",
          duration: 8000,
        });

        updatePropertyMutation.mutate({
          id: propertyId,
          data: {
            approval_status: "approved",
            listing_status: "active",
          },
        });
        break;
      case "Delist":
        updatePropertyMutation.mutate({
          id: propertyId,
          data: {
            listing_status: "suspended",
          },
        });
        toast({
          title: "Property Delisted",
          description:
            "The property has been delisted and removed from active listings.",
        });
        break;
      case "Reactivate":
        updatePropertyMutation.mutate({
          id: propertyId,
          data: {
            approval_status: "approved",
            listing_status: "active",
          },
        });
        toast({
          title: "Property Relisted",
          description:
            "The property has been relisted and is now available for investment.",
        });
        break;
      case "ApproveToken":
        // Find the tokenization that needs approval
        const property = managedProperties.find((p) => p.id === propertyId);
        const tokenization = property?.tokenizations?.find(
          (token: any) => token.status === "pending" || token.status === "draft"
        );

        if (tokenization) {
          // Update tokenization status to approved
          try {
            const { error } = await supabase
              .from("tokenizations")
              .update({
                status: "active",
                approved_at: new Date().toISOString(),
                approved_by: (await supabase.auth.getUser()).data.user?.id,
              })
              .eq("id", tokenization.id);

            if (error) {
              throw error;
            }

            toast({
              title: "Token Approved",
              description:
                "The tokenization has been approved and is now available for investment.",
            });

            // Refresh the properties list
            refetch();
          } catch (error: any) {
            console.error("Error approving token:", error);
            toast({
              title: "Approval Failed",
              description: error.message || "Failed to approve tokenization.",
              variant: "destructive",
            });
          }
        }
        break;
      case "Delete":
        updatePropertyMutation.mutate({
          id: propertyId,
          data: { listing_status: "deleted" },
        });
        toast({
          title: "Property Deleted",
          description: "The property has been deleted.",
          variant: "destructive",
        });
        break;
    }

    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handlePropertyAction = async (action: string, propertyId: string) => {
    const property = managedProperties.find((p) => p.id === propertyId);

    switch (action) {
      case "View":
        navigate(`/property/${propertyId}/view`);
        break;
      case "Edit":
        navigate(`/property/${propertyId}/edit`);
        break;
      case "Approve":
        const hasDocuments =
          property?.property_documents &&
          property.property_documents.length > 0;

        if (!hasDocuments) {
          toast({
            title: "Cannot Approve Property",
            description:
              "Please upload at least one document before approving this property.",
            variant: "destructive",
          });
          return;
        }

        showConfirmDialog(
          action,
          propertyId,
          "Approve Property",
          "Are you sure you want to approve this property? It will be made available for investment."
        );
        break;
      case "Delist":
        showConfirmDialog(
          action,
          propertyId,
          "Delist Property",
          "Are you sure you want to delist this property? It will be removed from active listings."
        );
        break;
      case "Reactivate":
        showConfirmDialog(
          action,
          propertyId,
          "Relist Property",
          "Are you sure you want to relist this property? It will be made available for investment again."
        );
        break;
      case "Tokenize":
        navigate(`/property/${propertyId}/tokenize`);
        break;
      case "ApproveToken":
        showConfirmDialog(
          action,
          propertyId,
          "Approve Token",
          "Are you sure you want to approve this tokenization? It will be made available for investment."
        );
        break;
      case "Delete":
        showConfirmDialog(
          action,
          propertyId,
          "Delete Property",
          "Are you sure you want to delete this property? This action cannot be undone.",
          "destructive"
        );
        break;
      default:
        toast({
          title: `${action} Property`,
          description: `${action} action initiated for property ${propertyId}`,
        });
    }
  };

  const filteredProperties = managedProperties.filter((prop) => {
    if (filter === "all") return true;

    switch (filter) {
      case "active":
        return (
          prop.approval_status === "approved" &&
          prop.listing_status === "active"
        );
      case "funded":
        return (
          prop.tokenizations &&
          prop.tokenizations.some(
            (token: any) =>
              token.status === "completed" ||
              token.current_raise >= token.target_raise
          )
        );
      case "tokenized":
        return prop.tokenizations && prop.tokenizations.length > 0;
      case "pending":
        return prop.approval_status === "pending";
      case "approved":
        return prop.approval_status === "approved";
      case "draft":
        return prop.listing_status === "draft";
      case "suspended":
        return prop.listing_status === "withdrawn";
      default:
        return (
          prop.approval_status === filter || prop.listing_status === filter
        );
    }
  });

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Property Management
            </h1>
            <p className="text-muted-foreground">
              Oversee your managed properties and operations
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/property/events")}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Record Events</span>
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Filter</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
            <Button size="sm" onClick={() => navigate("/properties/register")}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Add Property</span>
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  ₦{financialSummary.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">Monthly estimated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  ₦{financialSummary.netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">After expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Occupancy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {Math.round(financialSummary.occupancyRate)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Investors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {financialSummary.totalInvestors}
                </div>
                <p className="text-xs text-muted-foreground">
                  {managedProperties.length} properties
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="properties" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All Properties
                  </Button>
                  <Button
                    variant={filter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === "funded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("funded")}
                  >
                    Fully Funded
                  </Button>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <Skeleton className="w-full md:w-32 h-32 rounded-lg" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-32" />
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, j) => (
                                  <div key={j}>
                                    <Skeleton className="h-3 w-16 mb-1" />
                                    <Skeleton className="h-4 w-12" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredProperties.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">
                          No properties found.
                        </p>
                        <Button
                          onClick={() => navigate("/properties/register")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Property
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredProperties.map((property) => (
                      <Card key={property.id} className="border border-border">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src="/placeholder.svg"
                              alt={property.title}
                              className="w-full md:w-32 h-32 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {property.title}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {property.location?.address ||
                                      "Location not specified"}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        property.approval_status === "approved"
                                          ? "default"
                                          : property.approval_status ===
                                            "pending"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                    >
                                      {property.approval_status}
                                    </Badge>

                                    {/* Tokenization Ready Badge */}
                                    {property.approval_status === "approved" &&
                                    property.listing_status === "active" &&
                                    (!property.tokenizations ||
                                      property.tokenizations.length === 0) &&
                                    property.property_documents &&
                                    property.property_documents.length > 0 ? (
                                      <Badge
                                        variant="outline"
                                        className="text-green-600 border-green-200"
                                      >
                                        Ready for Tokenization
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">
                                    Est. Monthly Revenue
                                  </p>
                                  <p className="font-semibold">
                                    ₦
                                    {Math.round(
                                      property.rental_income_monthly || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Est. Net Income
                                  </p>
                                  <p className="font-semibold">
                                    ₦
                                    {Math.round(
                                      (property.rental_income_monthly || 0) *
                                        0.8
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Property Value
                                  </p>
                                  <p className="font-semibold">
                                    ₦{property.estimated_value.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Property Type
                                  </p>
                                  <p className="font-semibold capitalize">
                                    {property.property_type}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex justify-between items-center text-sm mb-2">
                                  <span>Tokenization Status</span>
                                  {property.tokenizations &&
                                  property.tokenizations.length > 0 ? (
                                    property.tokenizations[0].status ===
                                    "active" ? (
                                      <Badge
                                        variant="default"
                                        className="bg-green-600"
                                      >
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant={
                                          property.tokenizations[0].status ===
                                          "completed"
                                            ? "secondary"
                                            : property.tokenizations[0]
                                                .status === "pending" ||
                                              property.tokenizations[0]
                                                .status === "draft"
                                            ? "outline"
                                            : "destructive"
                                        }
                                      >
                                        {property.tokenizations[0].status}
                                      </Badge>
                                    )
                                  ) : (
                                    <Badge
                                      variant="default"
                                      className="bg-green-600"
                                    >
                                      Not Tokenized
                                    </Badge>
                                  )}
                                </div>
                                {property.tokenizations &&
                                property.tokenizations.length > 0 ? (
                                  <Progress
                                    value={
                                      (property.tokenizations[0].current_raise /
                                        property.tokenizations[0]
                                          .target_raise) *
                                      100
                                    }
                                    className="h-2"
                                  />
                                ) : (
                                  <div className="text-sm text-muted-foreground"></div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3 mb-3">
                                <Badge
                                  variant="outline"
                                  className="text-orange-600"
                                >
                                  <Wrench className="h-3 w-3 mr-1" />0
                                  maintenance
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />0
                                  urgent
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePropertyAction("View", property.id)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handlePropertyAction("Edit", property.id)
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>

                                {/* More Actions Dropdown - Only show if there are additional actions */}
                                {getDropdownActions(property).length > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                          More actions
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48 bg-background border-2 border-primary"
                                    >
                                      <DropdownMenuLabel>
                                        More Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {getDropdownActions(property).map(
                                        (actionItem, index) => {
                                          const Icon = actionItem.icon;
                                          return (
                                            <DropdownMenuItem
                                              key={index}
                                              onClick={() =>
                                                !actionItem.disabled &&
                                                handlePropertyAction(
                                                  actionItem.action,
                                                  property.id
                                                )
                                              }
                                              disabled={actionItem.disabled}
                                              className={cn(
                                                actionItem.disabled
                                                  ? "text-muted-foreground cursor-not-allowed opacity-50"
                                                  : actionItem.variant ===
                                                    "destructive"
                                                  ? "text-red-600 focus:text-red-600 hover:bg-gray-100"
                                                  : actionItem.variant ===
                                                    "success"
                                                  ? "text-green-600 focus:text-green-600 hover:bg-gray-100"
                                                  : actionItem.variant ===
                                                    "warning"
                                                  ? "text-orange-600 focus:text-orange-600 hover:bg-gray-100"
                                                  : "hover:bg-gray-100",
                                                "focus:bg-primary/50 focus:text-white"
                                              )}
                                            >
                                              <Icon className="h-4 w-4 mr-2" />
                                              {actionItem.label}
                                            </DropdownMenuItem>
                                          );
                                        }
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Maintenance Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No maintenance requests yet. This feature will be
                        available once you have active properties with proper
                        maintenance tracking.
                      </p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Maintenance Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Revenue analytics chart would be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.property}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Dividends
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <VaultMigrationButton/>
              </CardContent>
            </Card>

            {/* Urgent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Urgent Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No urgent issues at the moment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={
                confirmDialog.variant === "destructive"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyManagement;
