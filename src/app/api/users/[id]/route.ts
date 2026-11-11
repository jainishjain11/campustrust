import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        accessGrants: {
          include: {
            asset: true,
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

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user details" },
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

    const { fullName, email, role, status, departmentId } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
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

    // Soft deactivate preferred to preserve audit trail
    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to deactivate user" },
      { status: 400 }
    );
  }
}

