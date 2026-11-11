import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "risks";

    let csvContent = "";
    let filename = `campustrust-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === "risks") {
      const risks = await prisma.riskFinding.findMany({
        include: {
          user: true,
          asset: true,
        },
        orderBy: { score: "desc" },
      });

      const headers = [
        "Finding Code",
        "Title",
        "Category",
        "Likelihood",
        "Impact",
        "Risk Score",
        "Severity",
        "Status",
        "Affected User",
        "Target Asset",
        "Detected At",
      ];

      const rows = risks.map((r) => [
        `"${r.findingCode}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        r.likelihood,
        r.impact,
        r.score,
        `"${r.severity}"`,
        `"${r.status}"`,
        `"${(r.user?.fullName || "N/A").replace(/"/g, '""')}"`,
        `"${(r.asset?.name || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(r.createdAt).toISOString()}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    } else if (type === "users") {
      const users = await prisma.user.findMany({
        include: { department: true },
        orderBy: { fullName: "asc" },
      });

      const headers = ["User ID", "Full Name", "University Email", "Role", "Department", "Status", "Created At"];
      const rows = users.map((u) => [
        `"${u.id}"`,
        `"${u.fullName.replace(/"/g, '""')}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${(u.department?.name || "Unassigned").replace(/"/g, '""')}"`,
        `"${u.status}"`,
        `"${new Date(u.createdAt).toISOString()}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    } else if (type === "assets") {
      const assets = await prisma.asset.findMany({
        orderBy: { criticality: "desc" },
      });

      const headers = ["Asset Code", "Name", "Category", "Criticality (1-5)", "Status", "Registered At"];
      const rows = assets.map((a) => [
        `"${a.code}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        a.criticality,
        `"${a.status}"`,
        `"${new Date(a.createdAt).toISOString()}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    } else if (type === "activity") {
      const logs = await prisma.activityLog.findMany({
        include: { user: true, asset: true },
        orderBy: { createdAt: "desc" },
      });

      const headers = ["Event ID", "Timestamp", "Event Type", "Action Code", "Description", "IP Address", "User", "Asset"];
      const rows = logs.map((l) => [
        `"${l.id}"`,
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${l.eventType}"`,
        `"${l.action}"`,
        `"${l.description.replace(/"/g, '""')}"`,
        `"${l.ipAddress || "local"}"`,
        `"${(l.user?.fullName || "N/A").replace(/"/g, '""')}"`,
        `"${(l.asset?.name || "N/A").replace(/"/g, '""')}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Report export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export report" },
      { status: 500 }
    );
  }
}
