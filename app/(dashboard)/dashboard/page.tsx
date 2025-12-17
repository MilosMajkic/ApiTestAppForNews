"use client";

import { useNews } from "@/hooks/useNews";
import { NewsFeed } from "@/components/news/NewsFeed";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGreeting } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { NewsTopic, NewsFilters } from "@/types/news";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedTopic, setSelectedTopic] = useState<NewsTopic | undefined>("general");
  const [filters, setFilters] = useState<NewsFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: articles, isLoading, error, refetch } = useNews({
    topic: selectedTopic,
    filters,
    enabled: !!selectedTopic,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentTopic={selectedTopic}
        onFilterClick={() => setIsFilterOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {session?.user?.name || "there"} 👋
          </h1>
          <p className="text-muted-foreground">
            Here are the most important news for you today.
          </p>
        </div>

        <NewsFeed
          articles={articles}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
        />
      </main>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedTopic={selectedTopic}
        filters={filters}
        onTopicChange={setSelectedTopic}
        onFiltersChange={setFilters}
      />
    </div>
  );
}


