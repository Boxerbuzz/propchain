import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";

export function useFavorites() {
  const queryClient = useQueryClient();

  // Get user's favorite properties
  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => supabaseService.favorites.getUserFavorites(),
  });

  // Check if a property is favorited
  const useIsFavorited = (propertyId: string) => {
    return useQuery({
      queryKey: ["favorites", propertyId],
      queryFn: () => supabaseService.favorites.isFavorited(propertyId),
      enabled: !!propertyId,
    });
  };

  // Toggle favorite status
  const toggleFavorite = useMutation({
    mutationFn: (propertyId: string) =>
      supabaseService.favorites.toggle(propertyId),
    onSuccess: (result, propertyId) => {
      // Update the specific property's favorite status
      queryClient.setQueryData(
        ["favorites", propertyId],
        result.action === "added"
      );

      // Update the favorites list
      queryClient.invalidateQueries({ queryKey: ["favorites"] });

      // Show success message
      toast.success(
        result.action === "added"
          ? "Added to favorites"
          : "Removed from favorites"
      );
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    },
  });

  return {
    favorites,
    isLoading,
    error,
    useIsFavorited,
    toggleFavorite,
  };
}
