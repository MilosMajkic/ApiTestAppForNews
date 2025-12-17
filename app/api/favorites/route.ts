import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const favoriteSchema = z.object({
  articleId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  imageUrl: z.string().url().nullable().optional(),
  source: z.string(),
  publishedAt: z.string(),
});

export async function GET() {
  try {
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

    const favorites = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM [Favorite] WHERE userId = ${user.id} ORDER BY savedAt DESC
    `;

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const validatedData = favoriteSchema.parse(body);

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

    // Check if already favorited
    const existing = await prisma.$queryRaw<Array<any>>`
      SELECT id FROM [Favorite] WHERE userId = ${user.id} AND articleId = ${validatedData.articleId}
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Article already favorited" },
        { status: 400 }
      );
    }

    // Create favorite using raw SQL
    const favoriteId = require('crypto').randomUUID();
    const publishedAt = new Date(validatedData.publishedAt);
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO [Favorite] (id, userId, articleId, title, description, url, imageUrl, source, publishedAt, savedAt)
      VALUES (${favoriteId}, ${user.id}, ${validatedData.articleId}, ${validatedData.title}, ${validatedData.description || null}, ${validatedData.url}, ${validatedData.imageUrl || null}, ${validatedData.source}, ${publishedAt}, ${now})
    `;

    // Fetch created favorite
    const favorites = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM [Favorite] WHERE id = ${favoriteId}
    `;

    const favorite = favorites && favorites.length > 0 ? favorites[0] : null;

    return NextResponse.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Create favorite error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

