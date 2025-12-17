"use client";

import { useQuery } from "@tanstack/react-query";
import { NewsFeed } from "@/components/news/NewsFeed";
import { Navbar } from "@/components/layout/Navbar";
import { Heart } from "lucide-react";
import { NewsArticle } from "@/types/news";

interface Favorite {
  id: string;
  articleId: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date;
}

export default function FavoritesPage() {
  const { data: favorites, isLoading, error } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });

  // Convert favorites to NewsArticle format
  const articles: NewsArticle[] | undefined = favorites?.map((fav) => ({
    title: fav.title,
    description: fav.description || null,
    url: fav.url,
    urlToImage: fav.imageUrl,
    source: {
      id: null,
      name: fav.source,
    },
    publishedAt: new Date(fav.publishedAt).toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onFilterClick={() => {}}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Favorites</h1>
            <p className="text-muted-foreground">
              Your saved articles
            </p>
          </div>
        </div>

        <NewsFeed
          articles={articles}
          isLoading={isLoading}
          error={error as Error | null}
        />
      </main>
    </div>
  );
}


