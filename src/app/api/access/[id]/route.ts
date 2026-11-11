import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { accessLevel, isExpected } = body;

    const updated = await prisma.accessGrant.update({
      where: { id },
      data: {
        ...(accessLevel !== undefined && { accessLevel }),
        ...(isExpected !== undefined && { isExpected }),
      },
      include: {
        user: true,
        asset: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "ACCESS_REVIEWED",
        description: `Reviewed access grant for ${updated.user.fullName} on ${updated.asset.name}. Verified as ${
          updated.isExpected ? "Compliant" : "Flagged Out-of-Role"
        }.`,
        eventType: "REVIEW",
        userId: updated.userId,
        assetId: updated.assetId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Access entitlement review status updated",
    });
  } catch (error) {
    console.error("Access PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update access entitlement" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const grant = await prisma.accessGrant.findUnique({
      where: { id },
      include: { user: true, asset: true },
    });

    if (!grant) {
      return NextResponse.json(
        { success: false, message: "Grant not found" },
        { status: 404 }
      );
    }

    await prisma.accessGrant.delete({
      where: { id },
    });

    // Record revocation in activity log
    await prisma.activityLog.create({
      data: {
        action: "ACCESS_REVOKED",
        description: `Revoked ${grant.accessLevel} access for ${grant.user.fullName} from ${grant.asset.name}.`,
        eventType: "ACCESS",
        userId: grant.userId,
        assetId: grant.assetId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Access entitlement for ${grant.user.fullName} on ${grant.asset.name} revoked successfully.`,
    });
  } catch (error) {
    console.error("Access DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revoke access entitlement" },
      { status: 400 }
    );
  }
}

