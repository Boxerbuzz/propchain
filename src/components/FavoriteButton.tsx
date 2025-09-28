import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  propertyId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({
  propertyId,
  variant = "secondary",
  size = "sm",
  className,
  showText = false,
}: FavoriteButtonProps) {
  const { useIsFavorited, toggleFavorite } = useFavorites();
  const { data: isFavorited, isLoading: isCheckingFav } = useIsFavorited(propertyId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(propertyId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isCheckingFav || toggleFavorite.isPending}
      className={cn(
        "transition-colors duration-200",
        isFavorited && "hover:bg-red-50 hover:text-red-600",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors duration-200",
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground",
          showText && "mr-2",
          size === "sm" ? "h-4 w-4" : "h-5 w-5"
        )}
      />
      {showText && (
        <span className="text-sm">
          {isFavorited ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}
