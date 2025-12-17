"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NewsArticle } from "@/types/news";
import { useToast } from "./use-toast";

interface Favorite {
  id: string;
  articleId: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
}

export function useFavorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (data) => {
      const ids = new Set(data.map((f: Favorite) => f.articleId));
      setFavoriteIds(ids);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (article: NewsArticle) => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.url,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      setFavoriteIds((prev) => new Set([...prev, data.articleId]));
      toast({
        title: "Saved",
        description: "Article saved to favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
    },
    onSuccess: (_, favoriteId) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      const favorite = favorites.find((f) => f.id === favoriteId);
      if (favorite) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(favorite.articleId);
          return next;
        });
      }
      toast({
        title: "Removed",
        description: "Article removed from favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove article",
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = (article: NewsArticle, articleId: string) => {
    if (favoriteIds.has(articleId)) {
      // Find the favorite ID from the favorites list
      const favorite = favorites.find((f) => f.articleId === articleId);
      if (favorite) {
        deleteMutation.mutate(favorite.id);
      }
    } else {
      saveMutation.mutate(article);
    }
  };

  const isFavorite = (articleId: string) => {
    return favoriteIds.has(articleId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoading: saveMutation.isPending || deleteMutation.isPending,
  };
}

