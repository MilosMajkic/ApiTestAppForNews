export interface NewsArticle {
  id?: string;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: {
    id: string | null;
    name: string;
  };
  publishedAt: string;
  content?: string | null;
  author?: string | null;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsFilters {
  topic?: string;
  sources?: string[];
  date?: "latest" | "past-week" | "past-month";
  query?: string;
  country?: string;
  language?: string;
}

export type NewsTopic =
  | "technology"
  | "business"
  | "sports"
  | "science"
  | "health"
  | "entertainment"
  | "general";


