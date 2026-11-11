import { prisma } from "@/lib/prisma";

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function calculateSeverity(score: number): RiskSeverity {
  if (score >= 17) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MEDIUM";
  return "LOW";
}

export async function runRiskAssessment(): Promise<{
  created: number;
  updated: number;
  totalActive: number;
}> {
  let created = 0;
  let updated = 0;

  // 1. Fetch current system state
  const [users, assets, grants, failedLogins] = await Promise.all([
    prisma.user.findMany({
      include: {
        accessGrants: { include: { asset: true } },
      },
    }),
    prisma.asset.findMany(),
    prisma.accessGrant.findMany({
      include: {
        user: true,
        asset: true,
      },
    }),
    prisma.activityLog.findMany({
      where: {
        eventType: "AUTHENTICATION",
        action: { contains: "FAILED" },
      },
    }),
  ]);

  type FindingDraft = {
    findingCode: string;
    title: string;
    description: string;
    category: string;
    likelihood: number;
    impact: number;
    score: number;
    severity: RiskSeverity;
    userId?: string;
    assetId?: string;
  };

  const findingsToUpsert: FindingDraft[] = [];

  // RULE 1: Inactive account still has active access grants (ID-01)
  for (const user of users) {
    if (user.status === "INACTIVE" && user.accessGrants.length > 0) {
      for (const grant of user.accessGrants) {
        const likelihood = 4;
        const impact = Math.max(grant.asset.criticality, 3);
        const score = likelihood * impact;
        const findingCode = `RSK-ID01-${user.id.slice(-4)}-${grant.asset.id.slice(-4)}`.toUpperCase();

        findingsToUpsert.push({
          findingCode,
          title: "Inactive identity retains active access",
          description: `Account for ${user.fullName} is marked INACTIVE, yet retains ${grant.accessLevel} access to ${grant.asset.name}.`,
          category: "IDENTITY_LIFECYCLE",
          likelihood,
          impact,
          score,
          severity: calculateSeverity(score),
          userId: user.id,
          assetId: grant.asset.id,
        });
      }
    }
  }

  // RULE 2: User has out-of-role or unexpected access (AC-01)
  for (const grant of grants) {
    if (!grant.isExpected) {
      const likelihood = 4;
      const impact = grant.asset.criticality;
      const score = likelihood * impact;
      const findingCode = `RSK-AC01-${grant.userId.slice(-4)}-${grant.assetId.slice(-4)}`.toUpperCase();

      findingsToUpsert.push({
        findingCode,
        title: "Unexpected out-of-role entitlement",
        description: `${grant.user.fullName} (${grant.user.role}) has uncertified ${grant.accessLevel} access to ${grant.asset.name}.`,
        category: "ACCESS_CONTROL",
        likelihood,
        impact,
        score,
        severity: calculateSeverity(score),
        userId: grant.userId,
        assetId: grant.assetId,
      });
    }
  }

  // RULE 3: Student has Privileged Admin Access (PR-01)
  for (const grant of grants) {
    if (grant.user.role === "STUDENT" && grant.accessLevel === "ADMIN") {
      const likelihood = 4;
      const impact = 5;
      const score = likelihood * impact;
      const findingCode = `RSK-PR01-${grant.userId.slice(-4)}-${grant.assetId.slice(-4)}`.toUpperCase();

      findingsToUpsert.push({
        findingCode,
        title: "Excessive administrative privilege granted to student",
        description: `Student account ${grant.user.fullName} holds administrative control over ${grant.asset.name}.`,
        category: "PRIVILEGED_ACCESS",
        likelihood,
        impact,
        score,
        severity: calculateSeverity(score),
        userId: grant.userId,
        assetId: grant.assetId,
      });
    }
  }

  // RULE 4: Repeated Failed Logins / Suspicious Activity (LG-01)
  // Count failed logins grouped by user
  const userFailedCounts: Record<string, number> = {};
  for (const log of failedLogins) {
    if (log.userId) {
      userFailedCounts[log.userId] = (userFailedCounts[log.userId] || 0) + 1;
    }
  }

  for (const [userId, count] of Object.entries(userFailedCounts)) {
    if (count >= 1) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        const likelihood = 4;
        const impact = 3;
        const score = likelihood * impact;
        const findingCode = `RSK-LG01-${user.id.slice(-4)}`.toUpperCase();

        findingsToUpsert.push({
          findingCode,
          title: "Repeated failed authentication events",
          description: `Simulated authentication anomalies (${count} failed login attempts) recorded for ${user.fullName}.`,
          category: "SUSPICIOUS_ACTIVITY",
          likelihood,
          impact,
          score,
          severity: calculateSeverity(score),
          userId: user.id,
        });
      }
    }
  }

  // Execute database upserts
  for (const f of findingsToUpsert) {
    const existing = await prisma.riskFinding.findUnique({
      where: { findingCode: f.findingCode },
    });

    if (existing) {
      if (existing.status !== "RESOLVED") {
        await prisma.riskFinding.update({
          where: { findingCode: f.findingCode },
          data: {
            title: f.title,
            description: f.description,
            likelihood: f.likelihood,
            impact: f.impact,
            score: f.score,
            severity: f.severity,
            category: f.category,
            userId: f.userId || null,
            assetId: f.assetId || null,
          },
        });
        updated++;
      }
    } else {
      await prisma.riskFinding.create({
        data: {
          findingCode: f.findingCode,
          title: f.title,
          description: f.description,
          category: f.category,
          likelihood: f.likelihood,
          impact: f.impact,
          score: f.score,
          severity: f.severity,
          status: "OPEN",
          userId: f.userId || null,
          assetId: f.assetId || null,
        },
      });
      created++;
    }
  }

  // Log assessment event
  await prisma.activityLog.create({
    data: {
      action: "RISK_EVALUATION",
      description: `Automated risk assessment evaluated rules. Identified ${findingsToUpsert.length} active risk conditions.`,
      eventType: "RISK",
    },
  });

  const totalActive = await prisma.riskFinding.count({
    where: { status: { not: "RESOLVED" } },
  });

  return { created, updated, totalActive };
}

