import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const incidents = await prisma.incident.findMany({
      where: {
        ...(status && status !== "ALL" && { status }),
        ...(priority && priority !== "ALL" && { priority }),
      },
      include: {
        asset: true,
        riskFinding: true,
        reportedBy: true,
        tasks: {
          include: {
            assignee: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: incidents,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Incidents GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, assetId, riskFindingId, reportedById, initialTaskTitle } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required" },
        { status: 400 }
      );
    }

    const count = await prisma.incident.count();
    const incidentCode = `INC-${String(count + 1).padStart(3, "0")}`;

    const incident = await prisma.incident.create({
      data: {
        incidentCode,
        title,
        description,
        priority: priority || "MEDIUM",
        status: "OPEN",
        assetId: assetId || null,
        riskFindingId: riskFindingId || null,
        reportedById: reportedById || null,
        tasks: {
          create: [
            {
              title: initialTaskTitle || "Perform root-cause investigation",
              description: "Review permissions, audit logs, and determine containment steps.",
              status: "PENDING",
            },
          ],
        },
      },
      include: {
        tasks: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "INCIDENT_CREATED",
        description: `Created security mitigation incident ${incidentCode}: ${title}.`,
        eventType: "INCIDENT",
        assetId: assetId || null,
      },
    });

    return NextResponse.json(
      { success: true, data: incident, message: `Incident ${incidentCode} created successfully.` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Incident POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create incident" },
      { status: 400 }
    );
  }
}
