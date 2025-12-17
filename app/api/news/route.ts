import { NextResponse } from "next/server";
import { newsApiService } from "@/lib/api/newsApi";
import { NewsFilters } from "@/types/news";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") as any;
    const query = searchParams.get("q");
    const sources = searchParams.get("sources")?.split(",");
    const date = searchParams.get("date") as any;
    const country = searchParams.get("country") || "us";
    const language = searchParams.get("language") || "en";

    const filters: NewsFilters = {
      sources,
      date,
      country,
      language,
    };

    let articles;

    if (query) {
      articles = await newsApiService.fetchNewsByQuery(query, filters);
    } else if (topic) {
      articles = await newsApiService.fetchNewsByTopic(topic, filters);
    } else {
      articles = await newsApiService.fetchTrendingNews(country);
    }

    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (error: any) {
    console.error("News API error:", error);
    
    // If NEWS_API_KEY is not configured, return a helpful error
    if (error.message?.includes("NEWS_API_KEY") || !process.env.NEWS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "News API key is not configured. Please set NEWS_API_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}

