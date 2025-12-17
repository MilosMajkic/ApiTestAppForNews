import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { newsApiService } from "@/lib/api/newsApi";
import { PersonalizationEngine } from "@/lib/ai/personalization";
import { NewsTopic } from "@/types/news";
import { checkPlanAccess, planCheckResponse } from "@/lib/middleware/planCheck";

export async function GET(request: Request) {
  try {
    const planCheck = await checkPlanAccess(request, {
      requiredPlan: "PREMIUM",
      feature: "Personalized feed",
    });

    const errorResponse = planCheckResponse(planCheck, 403);
    if (errorResponse) return errorResponse;

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Use raw SQL to avoid OFFSET issue
    const users = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM [User] WHERE email = ${session.user.email}
    `;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    const { searchParams } = new URL(request.url);
    const topic = (searchParams.get("topic") as NewsTopic) || "general";

    // Fetch articles
    const articles = await newsApiService.fetchNewsByTopic(topic);

    // Calculate relevance scores and sort
    const scoredArticles = await PersonalizationEngine.calculateRelevanceScores(
      user.id,
      articles
    );

    // Return top articles
    const personalizedArticles = scoredArticles
      .slice(0, 20)
      .map((item) => item.article);

    return NextResponse.json({
      success: true,
      data: personalizedArticles,
    });
  } catch (error: any) {
    console.error("Personalized news API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch personalized news",
      },
      { status: 500 }
    );
  }
}

