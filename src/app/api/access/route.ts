import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const assetId = searchParams.get("assetId");
    const unexpectedOnly = searchParams.get("unexpectedOnly") === "true";

    const grants = await prisma.accessGrant.findMany({
      where: {
        ...(userId && { userId }),
        ...(assetId && { assetId }),
        ...(unexpectedOnly && { isExpected: false }),
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        asset: true,
      },
      orderBy: [
        { isExpected: "asc" }, // unexpected first
        { grantedAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: grants,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Access GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access grants" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, assetId, accessLevel, isExpected } = body;

    if (!userId || !assetId || !accessLevel) {
      return NextResponse.json(
        { success: false, message: "User, Asset, and Access Level are required" },
        { status: 400 }
      );
    }

    // Check user and asset
    const [user, asset] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.asset.findUnique({ where: { id: assetId } }),
    ]);

    if (!user || !asset) {
      return NextResponse.json(
        { success: false, message: "User or Asset not found" },
        { status: 404 }
      );
    }

    // Role-based heuristic for expected access:
    // Students should only have READ on standard student systems
    // Administrative access on high-criticality assets by non-admins is marked unexpected
    let expected = isExpected !== undefined ? isExpected : true;
    if (user.role === "STUDENT" && accessLevel === "ADMIN") {
      expected = false;
    }
    if (user.role === "STUDENT" && asset.criticality >= 4) {
      expected = false;
    }

    const grant = await prisma.accessGrant.upsert({
      where: {
        userId_assetId: {
          userId,
          assetId,
        },
      },
      update: {
        accessLevel,
        isExpected: expected,
      },
      create: {
        userId,
        assetId,
        accessLevel,
        isExpected: expected,
      },
      include: {
        user: true,
        asset: true,
      },
    });

    // Record in activity log
    await prisma.activityLog.create({
      data: {
        action: "ACCESS_GRANTED",
        description: `Granted ${accessLevel} access to ${user.fullName} for ${asset.name}${!expected ? " (Flagged Out-of-Role)" : ""}.`,
        eventType: expected ? "ACCESS" : "SUSPICIOUS_ACTIVITY",
        userId,
        assetId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: grant,
        message: expected
          ? "Access grant created successfully"
          : "Access grant created (Flagged as unexpected out-of-role entitlement)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Access POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create access entitlement" },
      { status: 400 }
    );
  }
}
