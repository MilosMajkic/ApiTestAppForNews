import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists using raw SQL
    const existingUsers = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM [User] WHERE email = ${validatedData.email}
    `;

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Generate user ID
    const userId = require('crypto').randomUUID();
    const now = new Date();

    // Create user using raw SQL to avoid OFFSET issue
    await prisma.$executeRaw`
      INSERT INTO [User] (id, email, name, passwordHash, [plan], createdAt, updatedAt)
      VALUES (${userId}, ${validatedData.email}, ${validatedData.name}, ${passwordHash}, 'FREE', ${now}, ${now})
    `;

    // Create default preferences using raw SQL
    const preferencesId = require('crypto').randomUUID();
    await prisma.$executeRaw`
      INSERT INTO [UserPreferences] (id, userId, topics, sources, language, darkMode, autoDarkMode, createdAt, updatedAt)
      VALUES (${preferencesId}, ${userId}, '[]', '[]', 'en', 0, 1, ${now}, ${now})
    `;

    // Fetch created user using raw SQL
    const users = await prisma.$queryRaw<Array<{ id: string; email: string; name: string }>>`
      SELECT id, email, name FROM [User] WHERE id = ${userId}
    `;

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      throw new Error("Failed to create user");
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    
    // Detaljnija greška za debugging
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Ako je Prisma greška, dodaj više detalja
      if (errorMessage.includes("Prisma") || errorMessage.includes("database")) {
        console.error("Database error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

