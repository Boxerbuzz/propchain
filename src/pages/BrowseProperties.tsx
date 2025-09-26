import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter, SlidersHorizontal, Grid, List, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProperties } from "@/hooks/useProperties";

export default function BrowseProperties() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const isMobile = useIsMobile();

  // Fetch real properties data
  const { data: tokenizations = [], isLoading, error } = useProperties();

  // Transform tokenizations to match PropertyCard interface
  const properties = tokenizations.map((tokenization) => ({
    id: tokenization.id,
    title: tokenization.property_title || "Property Name",
    location:
      typeof tokenization.property_location === "object"
        ? `${tokenization.property_location?.city || ""}, ${
            tokenization.property_location?.state || ""
          }`
        : tokenization.property_location || "Location",
    price: tokenization.target_raise || tokenization.current_raise || 0,
    expectedReturn: tokenization.expected_roi_annual || 0,
    tokensSold: Number(tokenization.tokens_sold) || 0,
    totalTokens: Number(tokenization.total_supply) || 1,
    investmentDeadline: tokenization.investment_window_end
      ? new Date(tokenization.investment_window_end).toLocaleDateString()
      : "TBD",
    imageUrl:
      tokenization.primary_image ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    status:
      tokenization.status === "active"
        ? ("active" as const)
        : tokenization.status === "upcoming"
        ? ("upcoming" as const)
        : tokenization.status === "completed"
        ? ("funded" as const)
        : ("upcoming" as const),
  }));

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filters = [
    {
      label: "All Properties",
      count: properties.length,
      active: statusFilter === "all",
    },
    {
      label: "Active",
      count: properties.filter((p) => p.status === "active").length,
      active: statusFilter === "active",
    },
    {
      label: "Upcoming",
      count: properties.filter((p) => p.status === "upcoming").length,
      active: statusFilter === "upcoming",
    },
    {
      label: "Funded",
      count: properties.filter((p) => p.status === "funded").length,
      active: statusFilter === "funded",
    },
  ];

  const locations = [
    "All Locations",
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Kano",
    "Ibadan",
  ];
  const returnRanges = ["All Returns", "5-10%", "10-15%", "15-20%", "20%+"];

  // Filter Component
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Search Properties
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Investment Status
        </label>
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                filter.active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted"
              }`}
              onClick={() => {
                const filterMap: Record<string, string> = {
                  "All Properties": "all",
                  Active: "active",
                  Upcoming: "upcoming",
                  Funded: "funded",
                };
                setStatusFilter(filterMap[filter.label] || "all");
              }}
            >
              <span className="font-medium">{filter.label}</span>
              <Badge variant={filter.active ? "default" : "secondary"}>
                {filter.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Location
        </label>
        <div className="space-y-2">
          {locations.map((location, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`location-${index}`}
                name="location"
                defaultChecked={index === 0}
                className="w-4 h-4 text-primary"
              />
              <label
                htmlFor={`location-${index}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Return Range */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Expected Returns
        </label>
        <div className="space-y-2">
          {returnRanges.map((range, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`return-${index}`}
                name="returns"
                defaultChecked={index === 0}
                className="w-4 h-4 text-primary"
              />
              <label
                htmlFor={`return-${index}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {range}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button
        className="w-full btn-primary"
        onClick={() => isMobile && setFilterOpen(false)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="container mx-auto flex-1 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 h-full pt-5">
          {/* Filters - Desktop Sidebar / Mobile Sheet */}
          {!isMobile ? (
            <aside className="lg:w-80 flex-shrink-0">
              <div className="h-full overflow-y-auto pr-2">
                <FilterContent />
              </div>
            </aside>
          ) : (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden mb-4 w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <FilterContent />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pl-2">
              {/* Mobile Filters Tab */}
              {isMobile && (
                <Tabs defaultValue="properties" className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger
                      value="filters"
                      onClick={() => setFilterOpen(true)}
                    >
                      Filters
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-muted-foreground">
                    {isLoading ? (
                      <Skeleton className="h-4 w-48" />
                    ) : (
                      `Showing ${filteredProperties.length} of ${properties.length} properties`
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* View Toggle */}
                  <div className="flex border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-md"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-md"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              {isLoading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Failed to load properties
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No properties match your search"
                      : "No properties available"}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} {...property} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button variant="default">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
