import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Square, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export default function Favorites() {
  const { favorites, isLoading, toggleFavorite, useIsFavorited } = useFavorites();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Favorites Yet</h1>
            <p className="text-muted-foreground">
              Properties you favorite will appear here. Start exploring and add some properties to your favorites!
            </p>
          </div>
          <Button asChild>
            <Link to="/browse">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
        <p className="text-muted-foreground">
          {favorites.length} propert{favorites.length === 1 ? 'y' : 'ies'} saved
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => {
          const property = favorite.properties;
          if (!property) return null;

          const { data: isFavorited, isLoading: isCheckingFav } = useIsFavorited(property.id);

          return (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/property/${property.id}/view`} className="block">
                {/* Property Image */}
                <div className="relative h-48 bg-muted">
                  {property.property_images?.[0]?.image_url ? (
                    <img
                      src={property.property_images[0].image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite.mutate(property.id);
                    }}
                    disabled={isCheckingFav || toggleFavorite.isPending}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      )}
                    />
                  </Button>

                  {/* Property Type Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 capitalize"
                  >
                    {property.property_type?.replace("_", " ")}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  {/* Title and Location */}
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">
                      {property.location?.address}, {property.location?.city}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.built_up_area && (
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        <span>{property.built_up_area.toLocaleString()} sq ft</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Investment Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Value</span>
                      <span className="font-semibold">
                        ₦{property.estimated_value?.toLocaleString()}
                      </span>
                    </div>
                    
                    {property.rental_income_monthly && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Income</span>
                        <span className="font-semibold text-green-600">
                          ₦{property.rental_income_monthly.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {property.tokenizations?.[0] && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Token Price</span>
                          <span className="font-semibold text-primary">
                            ₦{property.tokenizations[0].price_per_token?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Min Investment</span>
                          <span className="font-semibold">
                            ₦{property.tokenizations[0].min_investment?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {property.tokenizations?.[0] && (
                      <Button size="sm" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Invest
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
