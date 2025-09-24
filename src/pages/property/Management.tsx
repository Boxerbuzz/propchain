import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  BarChart3,
  Wrench,
  MessageSquare,
  AlertTriangle,
  Upload,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { useNavigate } from "react-router-dom";

const PropertyManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filter, setFilter] = useState("all");
  
  const {
    properties: managedProperties,
    financialSummary,
    isLoading,
    error,
    refetch,
    updateProperty,
    deleteProperty,
  } = usePropertyManagement();

  // Mock maintenance requests using useMemo to ensure stable reference
  const maintenanceRequests = useMemo(() => [
    {
      id: "req1",
      propertyId: "prop1",
      unit: "Unit 4A",
      issue: "HVAC system not working properly",
      priority: "high",
      status: "pending",
      reportedDate: "2024-09-18",
      estimatedCost: 850,
      actualCost: null,
      description: "Tenant reports inconsistent heating and cooling. May need professional inspection.",
    },
    {
      id: "req2",
      propertyId: "prop1", 
      unit: "Common Area",
      issue: "Elevator maintenance required",
      priority: "medium",
      status: "in-progress",
      reportedDate: "2024-09-15",
      estimatedCost: 1200,
      actualCost: null,
      description: "Scheduled quarterly maintenance for elevator system.",
    },
    {
      id: "req3",
      propertyId: "prop2",
      unit: "Office 2B",
      issue: "Window leak during rain",
      priority: "low",
      status: "completed",
      reportedDate: "2024-09-10",
      estimatedCost: 320,
      actualCost: 320,
      description: "Water seepage through window seal during heavy rain.",
    },
  ], []);
  
  const recentActivity = useMemo(() => [
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
  ], [managedProperties]);

  const handlePropertyAction = async (action: string, propertyId: string) => {
    switch (action) {
      case 'View':
        navigate(`/properties/${propertyId}`);
        break;
      case 'Edit':
        navigate(`/properties/${propertyId}/edit`);
        break;
      case 'Approve':
        await updateProperty(propertyId, { approval_status: 'approved', listing_status: 'active' });
        break;
      case 'Tokenize':
        navigate(`/properties/${propertyId}/tokenize`);
        break;
      case 'Upload Images':
        navigate(`/properties/${propertyId}/images`);
        break;
      case 'Upload Documents':
        navigate(`/properties/${propertyId}/documents`);
        break;
      case 'Delete':
        if (window.confirm('Are you sure you want to delete this property?')) {
          await deleteProperty(propertyId);
        }
        break;
      default:
        toast({
          title: `${action} Property`,
          description: `${action} action initiated for property ${propertyId}`,
        });
    }
  };

  const handleMaintenanceUpdate = (requestId: string, newStatus: string) => {
    toast({
      title: "Maintenance Updated",
      description: `Request ${requestId} status updated to ${newStatus}`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProperties = managedProperties.filter((prop) => {
    if (filter === "all") return true;
    return prop.status === filter;
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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/properties/register')}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Property</span>
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
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
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
                  {financialSummary.propertiesManaged} properties
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
                        <p className="text-muted-foreground mb-4">No properties found.</p>
                        <Button onClick={() => navigate('/properties/register')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Property
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={property.primaryImage}
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
                                    {property.location?.address || 'Location not specified'}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
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
                                    {property.investors > 0 && (
                                      <span className="text-sm text-muted-foreground">
                                        {property.investors} investors
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePropertyAction('View', property.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">View</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePropertyAction('Edit', property.id)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePropertyAction('Upload Images', property.id)}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Images</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePropertyAction('Upload Documents', property.id)}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Docs</span>
                                  </Button>
                                  {property.approval_status === 'approved' && !property.tokenizations?.length && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handlePropertyAction('Tokenize', property.id)}
                                    >
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Tokenize</span>
                                    </Button>
                                  )}
                                  {property.approval_status === 'pending' && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handlePropertyAction('Approve', property.id)}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">
                                    Est. Monthly Revenue
                                  </p>
                                  <p className="font-semibold">
                                    ₦{Math.round(property.monthlyRevenue).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Est. Net Income
                                  </p>
                                  <p className="font-semibold">
                                    ₦{Math.round(property.netIncome).toLocaleString()}
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

                              {property.totalTokens > 0 && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm mb-2">
                                    <span>Funding Progress</span>
                                    <span>{Math.round(property.fundingProgress)}%</span>
                                  </div>
                                  <Progress
                                    value={property.fundingProgress}
                                    className="h-2"
                                  />
                                </div>
                              )}

                              {(property.maintenanceRequests > 0 ||
                                property.pendingIssues > 0) && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {property.maintenanceRequests > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-orange-600"
                                    >
                                      <Wrench className="h-3 w-3 mr-1" />
                                      {property.maintenanceRequests} maintenance
                                    </Badge>
                                  )}
                                  {property.pendingIssues > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-red-600"
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {property.pendingIssues} urgent
                                    </Badge>
                                  )}
                                </div>
                              )}
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
                    <div className="space-y-4">
                      {maintenanceRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-medium">{request.issue}</h4>
                                <Badge
                                  variant="secondary"
                                  className={getPriorityColor(request.priority)}
                                >
                                  {request.priority} priority
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={getStatusColor(request.status)}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {request.unit} • Reported {request.reportedDate}
                              </p>
                              <p className="text-sm mt-1">
                                {request.description}
                              </p>
                            </div>
                            <div className="text-right mt-2 md:mt-0">
                              <p className="font-semibold">
                                $
                                {(
                                  request.estimatedCost || request.actualCost
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.actualCost
                                  ? "Actual cost"
                                  : "Estimated cost"}
                              </p>
                            </div>
                          </div>

                          {request.status !== "completed" && (
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline">
                                Update Status
                              </Button>
                              <Button size="sm" variant="outline">
                                Assign Contractor
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Contact Tenant
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Occupancy Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Occupancy trends chart would be displayed here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                <div className="space-y-3">
                  {maintenanceRequests
                    .filter(
                      (req) =>
                        req.priority === "high" && req.status === "pending"
                    )
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                      >
                        <p className="text-sm font-medium">{request.issue}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.unit}
                        </p>
                        <Button size="sm" className="mt-2 w-full">
                          Resolve Now
                        </Button>
                      </div>
                    ))}
                  {maintenanceRequests.filter(
                    (req) => req.priority === "high" && req.status === "pending"
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No urgent issues at this time
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;