import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, priority, description } = body;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { riskFinding: true },
    });

    if (!incident) {
      return NextResponse.json(
        { success: false, message: "Incident not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(description !== undefined && { description }),
      },
      include: {
        tasks: true,
        riskFinding: true,
      },
    });

    // If incident resolved, automatically resolve linked risk finding
    if (status === "RESOLVED" && incident.riskFindingId) {
      await prisma.riskFinding.update({
        where: { id: incident.riskFindingId },
        data: { status: "RESOLVED" },
      });
    }

    await prisma.activityLog.create({
      data: {
        action: "INCIDENT_UPDATED",
        description: `Incident ${incident.incidentCode} status changed to ${status || incident.status}.`,
        eventType: "INCIDENT",
        assetId: incident.assetId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Incident ${incident.incidentCode} updated successfully.`,
    });
  } catch (error) {
    console.error("Incident PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update incident" },
      { status: 400 }
    );
  }
}

