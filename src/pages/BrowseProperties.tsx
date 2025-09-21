import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter, MapPin, SlidersHorizontal, Grid, List, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BrowseProperties() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mock properties data
  const properties = [
    {
      id: "1",
      title: "Luxury Apartment Complex - Ikoyi",
      location: "Ikoyi, Lagos",
      price: 500000000,
      expectedReturn: 12,
      tokensSold: 750,
      totalTokens: 1000,
      investmentDeadline: "Dec 31, 2024",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      status: "active" as const
    },
    {
      id: "2",
      title: "Commercial Plaza - Victoria Island", 
      location: "Victoria Island, Lagos",
      price: 750000000,
      expectedReturn: 15,
      tokensSold: 600,
      totalTokens: 1200,
      investmentDeadline: "Jan 15, 2025",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      status: "active" as const
    },
    {
      id: "3",
      title: "Residential Estate - Lekki",
      location: "Lekki, Lagos", 
      price: 300000000,
      expectedReturn: 10,
      tokensSold: 400,
      totalTokens: 800,
      investmentDeadline: "Feb 28, 2025",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      status: "upcoming" as const
    },
    {
      id: "4",
      title: "Mixed-Use Development - Abuja",
      location: "Central Area, Abuja",
      price: 1000000000,
      expectedReturn: 18,
      tokensSold: 1000,
      totalTokens: 1000,
      investmentDeadline: "Completed",
      imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=300&fit=crop",
      status: "funded" as const
    },
    {
      id: "5",
      title: "Shopping Center - Port Harcourt",
      location: "GRA, Port Harcourt",
      price: 400000000,
      expectedReturn: 14,
      tokensSold: 320,
      totalTokens: 600,
      investmentDeadline: "Mar 15, 2025",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      status: "active" as const
    },
    {
      id: "6",
      title: "Office Complex - Ikeja",
      location: "Ikeja, Lagos",
      price: 600000000,
      expectedReturn: 13,
      tokensSold: 200,
      totalTokens: 900,
      investmentDeadline: "Apr 30, 2025",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      status: "upcoming" as const
    }
  ];

  const filters = [
    { label: "All Properties", count: properties.length, active: true },
    { label: "Active", count: properties.filter(p => p.status === "active").length, active: false },
    { label: "Upcoming", count: properties.filter(p => p.status === "upcoming").length, active: false },
    { label: "Funded", count: properties.filter(p => p.status === "funded").length, active: false }
  ];

  const locations = ["All Locations", "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];
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
      <Button className="w-full btn-primary" onClick={() => isMobile && setFilterOpen(false)}>
        <Filter className="h-4 w-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="container mx-auto flex-1 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
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
                    <TabsTrigger value="filters" onClick={() => setFilterOpen(true)}>Filters</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Showing {properties.length} properties
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
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button variant="default">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}