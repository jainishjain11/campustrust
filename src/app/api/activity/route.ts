import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType");
    const userId = searchParams.get("userId");
    const assetId = searchParams.get("assetId");
    const limit = Number(searchParams.get("limit")) || 50;

    const logs = await prisma.activityLog.findMany({
      where: {
        ...(eventType && eventType !== "ALL" && { eventType }),
        ...(userId && { userId }),
        ...(assetId && { assetId }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Activity GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
