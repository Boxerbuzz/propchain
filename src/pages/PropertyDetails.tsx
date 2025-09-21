import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import { MapPin, Building, Users, Calendar, TrendingUp, FileText, MessageCircle, Play, ArrowLeft, Share, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function PropertyDetails() {
  // Mock property data
  const property = {
    id: "1",
    title: "Luxury Apartment Complex - Ikoyi",
    location: "Ikoyi, Lagos State, Nigeria",
    price: 500000000,
    expectedReturn: 12,
    tokensSold: 750,
    totalTokens: 1000,
    tokenPrice: 500000,
    minimumInvestment: 100000,
    investmentDeadline: "December 31, 2024",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    description: `This luxury apartment complex in the heart of Ikoyi represents one of Lagos's most prestigious residential developments. 
    
    The property features 48 premium units across 12 floors, with stunning views of Lagos Marina and the Atlantic Ocean. Each apartment 
    boasts high-end finishes, smart home technology, and access to world-class amenities including a rooftop infinity pool, fitness center, 
    and 24/7 concierge service.
    
    Located in one of Nigeria's most sought-after neighborhoods, this property offers both capital appreciation potential and steady rental income 
    from the thriving luxury rental market in Ikoyi.`,
    
    features: [
      "48 luxury apartments",
      "12-story modern design", 
      "Rooftop infinity pool",
      "State-of-the-art fitness center",
      "24/7 security & concierge",
      "Smart home automation",
      "Marina and ocean views",
      "Premium location in Ikoyi"
    ],
    
    financials: {
      propertyValue: "₦500,000,000",
      rentalYield: "8.5% annually",
      appreciationForecast: "3.5% annually",
      totalExpectedReturn: "12% annually",
      managementFee: "2% of rental income",
      platformFee: "1% on investment"
    },
    
    documents: [
      { name: "Property Title", type: "Certificate of Occupancy", verified: true },
      { name: "Building Plans", type: "Architectural Drawings", verified: true },
      { name: "Valuation Report", type: "Professional Assessment", verified: true },
      { name: "Legal Documentation", type: "Property Purchase Agreement", verified: true }
    ]
  };

  const progressPercentage = (property.tokensSold / property.totalTokens) * 100;

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
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
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
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </div>
                {property.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    {index === 2 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Button variant="secondary" className="text-white">
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
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <Badge className="status-verified">Active</Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-background-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-primary mr-1" />
                    <span className="text-sm text-muted-foreground">Property Value</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">₦{property.price.toLocaleString()}</p>
                </div>
                
                <div className="bg-background-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-sm text-muted-foreground">Expected Return</span>
                  </div>
                  <p className="text-lg font-bold text-success">{property.expectedReturn}% p.a.</p>
                </div>
                
                <div className="bg-background-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">Investors</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{property.tokensSold}</p>
                </div>
                
                <div className="bg-background-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-warning mr-1" />
                    <span className="text-sm text-muted-foreground">Deadline</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">Dec 31, 2024</p>
                </div>
              </div>

              {/* Investment Progress */}
              <div className="bg-background-muted border border-border rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground">Investment Progress</h3>
                  <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(1)}% Complete</span>
                </div>
                <div className="w-full bg-muted rounded-lg h-3 mb-4">
                  <div 
                    className="bg-primary h-3 rounded-lg transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{property.tokensSold} tokens sold</span>
                  <span>{property.totalTokens - property.tokensSold} remaining</span>
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
                    <h3 className="text-xl font-semibold text-foreground mb-4">Property Description</h3>
                    <div className="text-muted-foreground space-y-4">
                      {property.description.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph.trim()}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financials" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(property.financials).map(([key, value], index) => (
                    <div key={index} className="bg-background-muted border border-border rounded-lg p-4">
                      <h4 className="font-medium text-foreground capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-lg font-semibold text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <div className="space-y-4">
                  {property.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-background-muted border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-medium text-foreground">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {doc.verified && <Badge className="status-verified">Verified</Badge>}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-6">
                <div className="bg-background-muted border border-border rounded-lg p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Join the Discussion</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other investors and get answers to your questions
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
              propertyValue={property.price}
              expectedReturn={property.expectedReturn}
              tokenPrice={property.tokenPrice}
              minimumInvestment={property.minimumInvestment}
            />

            {/* Quick Actions */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
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
              <h3 className="font-semibold text-foreground mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <div key={index} className="flex space-x-3">
                    <img 
                      src={`https://images.unsplash.com/photo-${1486406146926 + index}?w=80&h=60&fit=crop`}
                      alt="Similar property"
                      className="w-20 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">Commercial Plaza</h4>
                      <p className="text-xs text-muted-foreground">Victoria Island</p>
                      <p className="text-sm font-semibold text-success">15% ROI</p>
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