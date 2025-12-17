import { NewsArticle } from "@/types/news";
import { prisma } from "@/lib/db/prisma";

interface UserInteraction {
  articleId: string;
  action: "viewed" | "saved" | "skipped" | "read";
  topic?: string;
  source?: string;
  timestamp: Date;
}

interface RelevanceScore {
  article: NewsArticle;
  score: number;
}

export class PersonalizationEngine {
  /**
   * Calculate relevance score for articles based on user interactions
   */
  static async calculateRelevanceScores(
    userId: string,
    articles: NewsArticle[]
  ): Promise<RelevanceScore[]> {
    // Get user preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Parse JSON strings to arrays
    const topics = preferences?.topics ? JSON.parse(preferences.topics) : [];
    const sources = preferences?.sources ? JSON.parse(preferences.sources) : [];

    // Get recent user interactions
    const interactions = await prisma.userInteraction.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { timestamp: "desc" },
      take: 1000,
    });

    // Calculate scores
    const scores: RelevanceScore[] = articles.map((article) => {
      let score = 0;

      // Topic preference boost
      if (topics && topics.length > 0) {
        const articleTopic = this.extractTopic(article);
        if (topics.includes(articleTopic)) {
          score += 20;
        }
      }

      // Source preference boost
      if (sources && sources.length > 0) {
        if (sources.includes(article.source.name)) {
          score += 15;
        }
      }

      // Interaction-based scoring
      const articleInteractions = interactions.filter(
        (i) => i.articleId === article.url
      );

      articleInteractions.forEach((interaction) => {
        switch (interaction.action) {
          case "saved":
            score += 30;
            break;
          case "read":
            score += 25;
            break;
          case "viewed":
            score += 10;
            break;
          case "skipped":
            score -= 15;
            break;
        }
      });

      // Topic interaction boost
      const topicInteractions = interactions.filter(
        (i) => i.topic === this.extractTopic(article)
      );
      const savedTopicCount = topicInteractions.filter(
        (i) => i.action === "saved"
      ).length;
      score += savedTopicCount * 5;

      // Source interaction boost
      const sourceInteractions = interactions.filter(
        (i) => i.source === article.source.name
      );
      const savedSourceCount = sourceInteractions.filter(
        (i) => i.action === "saved"
      ).length;
      score += savedSourceCount * 3;

      // Recency boost (newer articles get slight boost)
      const articleAge = Date.now() - new Date(article.publishedAt).getTime();
      const daysOld = articleAge / (1000 * 60 * 60 * 24);
      if (daysOld < 1) score += 5;
      else if (daysOld < 7) score += 2;

      return { article, score: Math.max(0, score) };
    });

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Track user interaction
   */
  static async trackInteraction(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    await prisma.userInteraction.create({
      data: {
        userId,
        articleId: interaction.articleId,
        action: interaction.action,
        topic: interaction.topic,
        source: interaction.source,
        timestamp: interaction.timestamp,
      },
    });

    // Auto-update preferences based on interactions
    await this.updatePreferencesFromInteractions(userId);
  }

  /**
   * Automatically update user preferences based on interactions
   */
  private static async updatePreferencesFromInteractions(
    userId: string
  ): Promise<void> {
    const interactions = await prisma.userInteraction.findMany({
      where: {
        userId,
        action: { in: ["saved", "read"] },
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Count topic and source preferences
    const topicCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();

    interactions.forEach((interaction) => {
      if (interaction.topic) {
        topicCounts.set(
          interaction.topic,
          (topicCounts.get(interaction.topic) || 0) + 1
        );
      }
      if (interaction.source) {
        sourceCounts.set(
          interaction.source,
          (sourceCounts.get(interaction.source) || 0) + 1
        );
      }
    });

    // Get top 5 topics and sources
    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    const topSources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source]) => source);

    // Update preferences if we have enough data
    if (topTopics.length > 0 || topSources.length > 0) {
      await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          topics: topTopics.length > 0 ? JSON.stringify(topTopics) : undefined,
          sources: topSources.length > 0 ? JSON.stringify(topSources) : undefined,
        },
        create: {
          userId,
          topics: JSON.stringify(topTopics),
          sources: JSON.stringify(topSources),
          language: "en",
        },
      });
    }
  }

  /**
   * Extract topic from article (simplified - in production, use NLP)
   */
  private static extractTopic(article: NewsArticle): string {
    // This is a simplified version
    // In production, you'd use NLP or category detection
    const title = article.title.toLowerCase();
    if (title.includes("tech") || title.includes("ai") || title.includes("software")) {
      return "technology";
    }
    if (title.includes("business") || title.includes("economy") || title.includes("market")) {
      return "business";
    }
    if (title.includes("sport") || title.includes("game") || title.includes("player")) {
      return "sports";
    }
    if (title.includes("health") || title.includes("medical") || title.includes("doctor")) {
      return "health";
    }
    if (title.includes("science") || title.includes("research") || title.includes("study")) {
      return "science";
    }
    return "general";
  }
}

