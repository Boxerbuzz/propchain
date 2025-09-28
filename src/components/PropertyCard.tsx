import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  expectedReturn: number;
  tokensSold: number;
  totalTokens: number;
  investmentDeadline: string;
  imageUrl: string;
  status: "active" | "funded" | "upcoming";
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  expectedReturn,
  tokensSold,
  totalTokens,
  investmentDeadline,
  imageUrl,
  status
}: PropertyCardProps) {
  const navigate = useNavigate();
  const progressPercentage = (tokensSold / totalTokens) * 100;
  
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="status-verified">Active</Badge>;
      case "funded":
        return <Badge className="status-pending">Fully Funded</Badge>;
      case "upcoming":
        return <Badge className="bg-accent/10 text-accent border border-accent/20">Upcoming</Badge>;
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
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
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
            <p className="text-xl font-bold text-foreground">₦{price.toLocaleString()}</p>
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
              <Users className="h-4 w-4 mr-1" />
              {tokensSold} / {totalTokens} tokens sold
            </div>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-lg h-2">
            <div 
              className="bg-primary h-2 rounded-lg transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          Investment deadline: {investmentDeadline}
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full btn-primary"
          disabled={status === "funded"}
          onClick={() => navigate(`/browse/${id}`)}
        >
          {status === "funded" ? "Fully Funded" : "View Details"}
        </Button>
      </div>
    </div>
  );
}