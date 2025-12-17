"use client";

import { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";
import { NewsSkeleton } from "./NewsSkeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface NewsFeedProps {
  articles: NewsArticle[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export function NewsFeed({ articles, isLoading, error, onRetry }: NewsFeedProps) {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load news</h3>
        <p className="text-muted-foreground text-center mb-4">
          {error.message || "Something went wrong while fetching news articles."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No articles found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Try adjusting your filters or check back later for new articles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => {
        // Create a unique ID for the article
        const articleId = article.url || `article-${index}`;
        return (
          <NewsCard
            key={articleId}
            article={article}
            isFavorite={isFavorite(articleId)}
            onToggleFavorite={(article) => {
              const id = article.url || `article-${index}`;
              toggleFavorite(article, id);
            }}
          />
        );
      })}
    </div>
  );
}


