import { NextResponse } from "next/server";
import { newsApiService } from "@/lib/api/newsApi";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "us";

    const articles = await newsApiService.fetchTrendingNews(country);

    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (error: any) {
    console.error("Trending news API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch trending news",
      },
      { status: 500 }
    );
  }
}


