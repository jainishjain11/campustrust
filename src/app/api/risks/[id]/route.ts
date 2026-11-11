import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, title, description } = body;

    const updated = await prisma.riskFinding.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        user: true,
        asset: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "RISK_STATUS_UPDATED",
        description: `Risk finding ${updated.findingCode} status changed to ${updated.status}.`,
        eventType: "RISK",
        userId: updated.userId,
        assetId: updated.assetId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Risk finding updated successfully",
    });
  } catch (error) {
    console.error("Risk PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update risk finding" },
      { status: 400 }
    );
  }
}

// POST: Escalate finding into an Incident
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { priority, title, description, assignedToId } = body;

    const finding = await prisma.riskFinding.findUnique({
      where: { id },
      include: { asset: true, user: true },
    });

    if (!finding) {
      return NextResponse.json(
        { success: false, message: "Risk finding not found" },
        { status: 404 }
      );
    }

    const count = await prisma.incident.count();
    const incidentCode = `INC-${String(count + 1).padStart(3, "0")}`;

    const incident = await prisma.incident.create({
      data: {
        incidentCode,
        title: title || `Incident: ${finding.title}`,
        description: description || finding.description,
        priority: priority || (finding.severity === "CRITICAL" ? "HIGH" : "MEDIUM"),
        status: "OPEN",
        riskFindingId: finding.id,
        assetId: finding.assetId,
        reportedById: assignedToId || null,
        tasks: {
          create: [
            {
              title: "Investigate root cause of risk finding",
              description: `Audit permissions and logs for ${finding.findingCode}.`,
              status: "PENDING",
            },
            {
              title: "Apply corrective mitigation",
              description: "Revoke excessive access or update user status as required.",
              status: "PENDING",
            },
          ],
        },
      },
      include: {
        tasks: true,
      },
    });

    // Update risk finding status to IN_PROGRESS
    await prisma.riskFinding.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });

    await prisma.activityLog.create({
      data: {
        action: "INCIDENT_ESCALATED",
        description: `Escalated risk finding ${finding.findingCode} to incident ${incidentCode}.`,
        eventType: "INCIDENT",
        userId: finding.userId,
        assetId: finding.assetId,
      },
    });

    return NextResponse.json({
      success: true,
      data: incident,
      message: `Created incident ${incidentCode} from risk finding ${finding.findingCode}.`,
    });
  } catch (error) {
    console.error("Risk escalate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to escalate risk to incident" },
      { status: 400 }
    );
  }
}

