import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateSummary } from "@/lib/ai/openai";
import { z } from "zod";

const summarizeSchema = z.object({
  articleId: z.string(),
  content: z.string(),
  title: z.string(),
});

const FREE_PLAN_LIMIT = 10;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = summarizeSchema.parse(body);

    // Use raw SQL to avoid OFFSET issue
    const users = await prisma.$queryRaw<Array<{ id: string; plan: string }>>`
      SELECT id, [plan] as plan FROM [User] WHERE email = ${session.user.email}
    `;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if summary already exists
    const existingSummary = await prisma.$queryRaw<Array<{ id: string; summary: string }>>`
      SELECT id, summary FROM [AISummary] WHERE userId = ${user.id} AND articleId = ${validatedData.articleId}
    `;

    if (existingSummary && existingSummary.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: existingSummary[0].summary,
          cached: true,
        },
      });
    }

    // Check usage limits for FREE plan
    if (user.plan === "FREE") {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const countResult = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM [AISummary] 
        WHERE userId = ${user.id} AND createdAt >= ${firstDayOfMonth}
      `;

      const summariesThisMonth = countResult && countResult.length > 0 ? countResult[0].count : 0;

      if (summariesThisMonth >= FREE_PLAN_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            error: `You've reached your monthly limit of ${FREE_PLAN_LIMIT} AI summaries. Upgrade to Premium for unlimited summaries.`,
          },
          { status: 403 }
        );
      }
    }

    // Generate summary
    const summary = await generateSummary(
      validatedData.content || validatedData.title
    );

    // Save summary using raw SQL
    const summaryId = require('crypto').randomUUID();
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [AISummary] (id, userId, articleId, summary, createdAt)
      VALUES (${summaryId}, ${user.id}, ${validatedData.articleId}, ${summary}, ${now})
    `;

    // Fetch saved summary
    const savedSummaries = await prisma.$queryRaw<Array<{ id: string; summary: string }>>`
      SELECT id, summary FROM [AISummary] WHERE id = ${summaryId}
    `;

    const savedSummary = savedSummaries && savedSummaries.length > 0 ? savedSummaries[0] : null;
    if (!savedSummary) {
      throw new Error("Failed to save summary");
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: savedSummary.summary,
        cached: false,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Summarize error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}

