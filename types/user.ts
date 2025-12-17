export type Plan = "FREE" | "PREMIUM" | "TEAM";

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

// Note: In database, topics and sources are stored as JSON strings
// Frontend should parse them: JSON.parse(preferences.topics)
export interface UserPreferences {
  id: string;
  userId: string;
  topics: string; // JSON string: ["technology", "business", ...] - parse with JSON.parse()
  sources: string; // JSON string: ["source1", "source2", ...] - parse with JSON.parse()
  region: string | null;
  language: string;
  darkMode: boolean;
  autoDarkMode: boolean;
}

// Helper type for frontend (parsed preferences)
export interface ParsedUserPreferences extends Omit<UserPreferences, 'topics' | 'sources'> {
  topics: string[];
  sources: string[];
}

export interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date;
  savedAt: Date;
}

