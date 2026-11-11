import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        accessGrants: {
          include: {
            user: {
              include: {
                department: true,
              },
            },
          },
        },
        riskFindings: {
          orderBy: {
            createdAt: "desc",
          },
        },
        activities: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Asset GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch asset details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, category, description, criticality, status } = body;

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(criticality !== undefined && { criticality: Number(criticality) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Asset updated successfully",
    });
  } catch (error) {
    console.error("Asset PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update asset" },
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

    const asset = await prisma.asset.update({
      where: { id },
      data: { status: "DECOMMISSIONED" },
    });

    return NextResponse.json({
      success: true,
      data: asset,
      message: "Asset decommissioned successfully",
    });
  } catch (error) {
    console.error("Asset DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to decommission asset" },
      { status: 400 }
    );
  }
}

