import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

type Plan = "FREE" | "PREMIUM" | "TEAM";

interface PlanCheckOptions {
  requiredPlan?: Plan;
  feature?: string;
}

export async function checkPlanAccess(
  request: Request,
  options: PlanCheckOptions = {}
): Promise<{ allowed: boolean; userPlan?: Plan; error?: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        allowed: false,
        error: "Unauthorized",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { plan: true },
    });

    if (!user) {
      return {
        allowed: false,
        error: "User not found",
      };
    }

    const userPlan = user.plan as Plan;

    if (options.requiredPlan) {
      const planHierarchy: Record<Plan, number> = {
        FREE: 0,
        PREMIUM: 1,
        TEAM: 2,
      };

      if (planHierarchy[userPlan] < planHierarchy[options.requiredPlan]) {
        return {
          allowed: false,
          userPlan,
          error: `${options.feature || "This feature"} requires ${options.requiredPlan} plan`,
        };
      }
    }

    return {
      allowed: true,
      userPlan,
    };
  } catch (error) {
    console.error("Plan check error:", error);
    return {
      allowed: false,
      error: "Internal server error",
    };
  }
}

export function planCheckResponse(
  checkResult: { allowed: boolean; error?: string },
  statusCode: number = 403
) {
  if (!checkResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: checkResult.error || "Access denied",
      },
      { status: statusCode }
    );
  }
  return null;
}


