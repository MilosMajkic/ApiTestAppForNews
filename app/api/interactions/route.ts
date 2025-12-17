import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { PersonalizationEngine } from "@/lib/ai/personalization";
import { z } from "zod";

const interactionSchema = z.object({
  articleId: z.string(),
  action: z.enum(["viewed", "saved", "skipped", "read"]),
  topic: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
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

    const body = await request.json();
    const validatedData = interactionSchema.parse(body);

    await PersonalizationEngine.trackInteraction(user.id, {
      ...validatedData,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Interaction tracked",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Track interaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

