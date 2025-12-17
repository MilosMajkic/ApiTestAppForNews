import { NextResponse } from "next/server";
import { newsApiService } from "@/lib/api/newsApi";
import { generateSummary } from "@/lib/ai/openai";

export async function GET(
  request: Request,
  { params }: { params: { url: string } }
) {
  try {
    const decodedUrl = decodeURIComponent(params.url);
    
    // Try to fetch article content from the URL
    // For now, we'll use a simple approach:
    // 1. Try to extract content using AI (if OpenAI is configured)
    // 2. Fall back to showing description/content from NewsAPI if available
    
    // Since we don't have direct access to the original article,
    // we'll return a structure that can be used by the reading mode
    // In a production app, you'd use a service like Mercury Reader API,
    // Readability API, or scrape the content
    
    const articleData = {
      url: decodedUrl,
      title: "Article",
      content: null as string | null,
      description: null as string | null,
      extracted: false,
    };

    // If OpenAI is configured, we could use it to summarize/extract
    // For now, we'll return the URL and let the frontend handle it
    // or use an iframe/embed approach
    
    return NextResponse.json({
      success: true,
      data: articleData,
    });
  } catch (error: any) {
    console.error("Article fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch article",
      },
      { status: 500 }
    );
  }
}


