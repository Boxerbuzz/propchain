import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Calendar, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

interface PropertyCardProps {
  id: string;
  property_id: string;
  title: string;
  location: string;
  price: number;
  expectedReturn: number;
  tokensSold: number;
  totalTokens: number;
  investmentDeadline: string;
  imageUrl: string;
  status: "active" | "funded" | "upcoming";
  tokenizationType?: "equity" | "debt" | "revenue";
}

export default function PropertyCard({
  id,
  property_id,
  title,
  location,
  price,
  expectedReturn,
  tokensSold,
  totalTokens,
  investmentDeadline,
  imageUrl,
  status,
  tokenizationType,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const progressPercentage = (tokensSold / totalTokens) * 100;

  const getTokenizationTypeBadge = () => {
    if (!tokenizationType) return null;
    
    const typeConfig = {
      equity: { label: "Ownership", className: "bg-primary/10 text-primary border border-primary/20" },
      debt: { label: "Lending", className: "bg-secondary/10 text-secondary border border-secondary/20" },
      revenue: { label: "Revenue", className: "bg-accent/10 text-accent border border-accent/20" },
    };
    
    const config = typeConfig[tokenizationType];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="status-verified">Active</Badge>;
      case "funded":
        return <Badge className="status-pending">Fully Funded</Badge>;
      case "upcoming":
        return (
          <Badge className="bg-accent/10 text-accent border border-accent/20">
            Upcoming
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="property-card">
      {/* Property Image */}
      <div className="relative mb-4">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {getTokenizationTypeBadge()}
          {getStatusBadge()}
        </div>
        <div className="absolute top-3 left-3">
          <FavoriteButton
            propertyId={property_id}
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Property Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        </div>

        {/* Price and Return */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Property Value</p>
            <p className="text-xl font-bold text-foreground">
              ₦{price.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Expected Return</p>
            <div className="flex items-center text-success font-semibold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {expectedReturn}% p.a.
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              {tokensSold.toLocaleString()} / {totalTokens.toLocaleString()} tokens sold
            </div>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Deadline */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          Investment deadline: {investmentDeadline}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/browse/${id}`)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 btn-primary"
            disabled={status === "funded"}
            onClick={() => navigate(`/browse/${id}/invest`)}
          >
            {status === "funded" ? "Fully Funded" : "Invest Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
