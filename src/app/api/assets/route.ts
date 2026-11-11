import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        _count: {
          select: {
            accessGrants: true,
            riskFindings: {
              where: { status: { not: "RESOLVED" } },
            },
            incidents: {
              where: { status: { not: "RESOLVED" } },
            },
          },
        },
      },
      orderBy: {
        criticality: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Assets GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, category, description, criticality, status } = body;

    if (!name || !code || !category) {
      return NextResponse.json(
        { success: false, message: "Name, unique code, and category are required" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        category,
        description: description || null,
        criticality: Number(criticality) || 3,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(
      { success: true, data: asset, message: "Digital asset registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assets POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register asset. Ensure the asset code is unique." },
      { status: 400 }
    );
  }
}

