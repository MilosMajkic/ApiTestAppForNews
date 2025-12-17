import { NewsArticle, NewsApiResponse, NewsFilters, NewsTopic } from "@/types/news";

const NEWS_API_BASE_URL = "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Topic to NewsAPI category mapping
const TOPIC_MAP: Record<NewsTopic, string> = {
  technology: "technology",
  business: "business",
  sports: "sports",
  science: "science",
  health: "health",
  entertainment: "entertainment",
  general: "general",
};

export class NewsApiService {
  private async fetchFromNewsAPI(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<NewsApiResponse> {
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not configured");
    }

    const url = new URL(`${NEWS_API_BASE_URL}${endpoint}`);
    url.searchParams.append("apiKey", NEWS_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchNewsByTopic(
    topic: NewsTopic,
    filters: NewsFilters = {}
  ): Promise<NewsArticle[]> {
    try {
      const category = TOPIC_MAP[topic] || "general";
      const params: Record<string, string> = {
        category,
        pageSize: "20",
      };

      if (filters.country) {
        params.country = filters.country;
      }

      if (filters.language) {
        params.language = filters.language;
      }

      if (filters.sources && filters.sources.length > 0) {
        // If sources are specified, use everything endpoint with sources
        return this.fetchNewsBySources(filters.sources, filters);
      }

      const data = await this.fetchFromNewsAPI("/top-headlines", params);
      return this.normalizeArticles(data.articles);
    } catch (error) {
      console.error("Error fetching news by topic:", error);
      throw error;
    }
  }

  async fetchNewsByQuery(
    query: string,
    filters: NewsFilters = {}
  ): Promise<NewsArticle[]> {
    try {
      const params: Record<string, string> = {
        q: query,
        pageSize: "20",
        sortBy: "publishedAt",
      };

      if (filters.language) {
        params.language = filters.language;
      }

      if (filters.date) {
        const dateFilter = this.getDateFilter(filters.date);
        if (dateFilter) {
          params.from = dateFilter;
        }
      }

      const data = await this.fetchFromNewsAPI("/everything", params);
      return this.normalizeArticles(data.articles);
    } catch (error) {
      console.error("Error fetching news by query:", error);
      throw error;
    }
  }

  async fetchNewsBySources(
    sources: string[],
    filters: NewsFilters = {}
  ): Promise<NewsArticle[]> {
    try {
      const params: Record<string, string> = {
        sources: sources.join(","),
        pageSize: "20",
      };

      const data = await this.fetchFromNewsAPI("/everything", params);
      return this.normalizeArticles(data.articles);
    } catch (error) {
      console.error("Error fetching news by sources:", error);
      throw error;
    }
  }

  async fetchTrendingNews(country: string = "us"): Promise<NewsArticle[]> {
    try {
      const data = await this.fetchFromNewsAPI("/top-headlines", {
        country,
        pageSize: "20",
      });
      return this.normalizeArticles(data.articles);
    } catch (error) {
      console.error("Error fetching trending news:", error);
      throw error;
    }
  }

  private normalizeArticles(articles: any[]): NewsArticle[] {
    return articles
      .filter((article) => article.title && article.url)
      .map((article) => ({
        title: article.title,
        description: article.description || null,
        url: article.url,
        urlToImage: article.urlToImage || null,
        source: {
          id: article.source?.id || null,
          name: article.source?.name || "Unknown",
        },
        publishedAt: article.publishedAt,
        content: article.content || null,
        author: article.author || null,
      }));
  }

  private getDateFilter(dateFilter: string): string | null {
    const now = new Date();
    switch (dateFilter) {
      case "past-week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString().split("T")[0];
      case "past-month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString().split("T")[0];
      default:
        return null;
    }
  }
}

export const newsApiService = new NewsApiService();


