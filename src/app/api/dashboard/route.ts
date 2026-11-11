import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      totalAssets,
      openRisks,
      resolvedRisks,
      riskFindings,
      recentFindings,
      recentActivities,
      departments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.asset.count(),
      prisma.riskFinding.count({
        where: {
          status: { not: "RESOLVED" },
        },
      }),
      prisma.riskFinding.count({
        where: {
          status: "RESOLVED",
        },
      }),
      prisma.riskFinding.groupBy({
        by: ["severity"],
        where: {
          status: { not: "RESOLVED" },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.riskFinding.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          asset: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.activityLog.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
          asset: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.department.findMany({
        include: {
          users: {
            include: {
              riskFindings: {
                where: { status: { not: "RESOLVED" } },
              },
            },
          },
        },
      }),
    ]);

    // Prepare severity distribution
    const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    const riskDistribution = severityOrder.map((severity) => {
      const matchingRisk = riskFindings.find(
        (item: { severity: string; _count: { _all: number } }) =>
          item.severity === severity
      );

      return {
        severity,
        count: matchingRisk?._count._all ?? 0,
      };
    });

    const criticalCount = riskDistribution.find((r) => r.severity === "CRITICAL")?.count ?? 0;
    const highCount = riskDistribution.find((r) => r.severity === "HIGH")?.count ?? 0;
    const mediumCount = riskDistribution.find((r) => r.severity === "MEDIUM")?.count ?? 0;

    // Deterministic Security Posture Score (0 - 100)
    const postureScore = Math.max(
      15,
      Math.min(100, Math.round(100 - (criticalCount * 18 + highCount * 10 + mediumCount * 4)))
    );

    // Department risk breakdown
    const departmentRisks = departments.map((dept) => {
      const riskCount = dept.users.reduce(
        (acc, user) => acc + user.riskFindings.length,
        0
      );
      return {
        department: dept.name,
        code: dept.code,
        userCount: dept.users.length,
        riskCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalAssets,
          openRisks,
          resolvedRisks,
          postureScore,
        },
        riskDistribution,
        departmentRisks,
        recentFindings,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard data.",
      },
      { status: 500 }
    );
  }
}
