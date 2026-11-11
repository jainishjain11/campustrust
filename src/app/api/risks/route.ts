import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const findings = await prisma.riskFinding.findMany({
      where: {
        ...(severity && severity !== "ALL" && { severity }),
        ...(status && status !== "ALL" && { status }),
        ...(category && category !== "ALL" && { category }),
      },
      include: {
        user: {
          include: { department: true },
        },
        asset: true,
        incidents: true,
      },
      orderBy: [
        { score: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: findings,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Risks GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch risk register" },
      { status: 500 }
    );
  }
}
