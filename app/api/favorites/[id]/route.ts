import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const favorites = await prisma.$queryRaw<Array<{ id: string; userId: string }>>`
      SELECT id, userId FROM [Favorite] WHERE id = ${params.id}
    `;

    if (!favorites || favorites.length === 0) {
      return NextResponse.json(
        { success: false, error: "Favorite not found" },
        { status: 404 }
      );
    }

    const favorite = favorites[0];

    if (favorite.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.$executeRaw`
      DELETE FROM [Favorite] WHERE id = ${params.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Favorite removed",
    });
  } catch (error) {
    console.error("Delete favorite error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

