import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
  topics: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  region: z.string().nullable().optional(),
  language: z.string().optional(),
  darkMode: z.boolean().optional(),
  autoDarkMode: z.boolean().optional(),
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

    // Get preferences
    const preferences = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM [UserPreferences] WHERE userId = ${user.id}
    `;

    if (!preferences || preferences.length === 0) {
      // Create default preferences using raw SQL
      const preferencesId = require('crypto').randomUUID();
      const now = new Date();
      await prisma.$executeRaw`
        INSERT INTO [UserPreferences] (id, userId, topics, sources, language, darkMode, autoDarkMode, createdAt, updatedAt)
        VALUES (${preferencesId}, ${user.id}, '[]', '[]', 'en', 0, 1, ${now}, ${now})
      `;
      
      // Fetch created preferences
      const newPreferences = await prisma.$queryRaw<Array<any>>`
        SELECT * FROM [UserPreferences] WHERE id = ${preferencesId}
      `;
      
      const prefs = newPreferences && newPreferences.length > 0 ? newPreferences[0] : null;
      if (!prefs) {
        throw new Error("Failed to create preferences");
      }
      
      // Parse JSON strings to arrays for frontend
      return NextResponse.json({
        success: true,
        data: {
          ...prefs,
          topics: JSON.parse(prefs.topics || "[]"),
          sources: JSON.parse(prefs.sources || "[]"),
        },
      });
    }

    const prefs = preferences[0];
    // Parse JSON strings to arrays for frontend
    return NextResponse.json({
      success: true,
      data: {
        ...prefs,
        topics: JSON.parse(prefs.topics || "[]"),
        sources: JSON.parse(prefs.sources || "[]"),
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

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

    // Check if preferences exist
    const existing = await prisma.$queryRaw<Array<any>>`
      SELECT id FROM [UserPreferences] WHERE userId = ${user.id}
    `;

    const now = new Date();
    const topics = JSON.stringify(validatedData.topics || []);
    const sources = JSON.stringify(validatedData.sources || []);
    const region = validatedData.region || null;
    const language = validatedData.language || "en";
    const darkMode = validatedData.darkMode !== undefined ? (validatedData.darkMode ? 1 : 0) : 0;
    const autoDarkMode = validatedData.autoDarkMode !== undefined ? (validatedData.autoDarkMode ? 1 : 0) : 1;

    if (existing && existing.length > 0) {
      // Update existing preferences
      await prisma.$executeRaw`
        UPDATE [UserPreferences]
        SET topics = ${topics},
            sources = ${sources},
            region = ${region},
            language = ${language},
            darkMode = ${darkMode},
            autoDarkMode = ${autoDarkMode},
            updatedAt = ${now}
        WHERE userId = ${user.id}
      `;
    } else {
      // Create new preferences
      const preferencesId = require('crypto').randomUUID();
      await prisma.$executeRaw`
        INSERT INTO [UserPreferences] (id, userId, topics, sources, region, language, darkMode, autoDarkMode, createdAt, updatedAt)
        VALUES (${preferencesId}, ${user.id}, ${topics}, ${sources}, ${region}, ${language}, ${darkMode}, ${autoDarkMode}, ${now}, ${now})
      `;
    }

    // Fetch updated preferences
    const preferences = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM [UserPreferences] WHERE userId = ${user.id}
    `;

    const prefs = preferences && preferences.length > 0 ? preferences[0] : null;
    if (!prefs) {
      throw new Error("Failed to update preferences");
    }

    // Parse JSON strings to arrays for frontend
    return NextResponse.json({
      success: true,
      data: {
        ...preferences,
        topics: JSON.parse(preferences.topics),
        sources: JSON.parse(preferences.sources),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Update preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

