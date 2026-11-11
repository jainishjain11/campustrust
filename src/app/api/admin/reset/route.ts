import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Clean existing records in foreign key order
    await prisma.mitigationTask.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.riskFinding.deleteMany({});
    await prisma.accessGrant.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.department.deleteMany({});

    // 2. Departments
    const departments = [
      { name: "Computer Science", code: "CSE" },
      { name: "Electronics", code: "ECE" },
      { name: "Administration", code: "ADM" },
      { name: "Library", code: "LIB" },
    ];

    for (const d of departments) {
      await prisma.department.create({ data: d });
    }

    const cse = await prisma.department.findUniqueOrThrow({ where: { code: "CSE" } });
    const ece = await prisma.department.findUniqueOrThrow({ where: { code: "ECE" } });
    const admin = await prisma.department.findUniqueOrThrow({ where: { code: "ADM" } });
    const library = await prisma.department.findUniqueOrThrow({ where: { code: "LIB" } });

    // 3. Seed Users
    const users = [
      {
        fullName: "Aarav Sharma",
        email: "aarav@example.edu",
        role: "FACULTY",
        departmentId: cse.id,
      },
      {
        fullName: "Priya Nair",
        email: "priya@example.edu",
        role: "FACULTY",
        departmentId: ece.id,
      },
      {
        fullName: "Rahul Mehta",
        email: "rahul@example.edu",
        role: "STUDENT",
        departmentId: cse.id,
      },
      {
        fullName: "Ananya Verma",
        email: "ananya@example.edu",
        role: "STUDENT",
        departmentId: library.id,
      },
      {
        fullName: "Security Analyst",
        email: "analyst@example.edu",
        role: "SECURITY_ANALYST",
        departmentId: admin.id,
      },
      {
        fullName: "Campus Administrator",
        email: "admin@example.edu",
        role: "ADMIN",
        departmentId: admin.id,
      },
    ];

    for (const u of users) {
      await prisma.user.create({ data: u });
    }

    // 4. Seed Digital Assets
    const assets = [
      {
        name: "Student Portal",
        code: "AST-001",
        category: "Academic",
        criticality: 4,
        description: "Campus academic grading and course registration system.",
      },
      {
        name: "Faculty Portal",
        code: "AST-002",
        category: "Academic",
        criticality: 4,
        description: "Faculty attendance, curriculum, and grade submission portal.",
      },
      {
        name: "Library Management System",
        code: "AST-003",
        category: "Library",
        criticality: 3,
        description: "Digital book catalog, catalog access, and borrowing ledger.",
      },
      {
        name: "Research Repository",
        code: "AST-004",
        category: "Research",
        criticality: 5,
        description: "High-value unpublished scientific manuscripts and patent data.",
      },
      {
        name: "Hostel Management Portal",
        code: "AST-005",
        category: "Administration",
        criticality: 3,
        description: "Student room allocation, mess management, and curfew logs.",
      },
      {
        name: "Examination Management System",
        code: "AST-006",
        category: "Academic",
        criticality: 5,
        description: "Confidential exam question bank and grade evaluation engine.",
      },
    ];

    for (const a of assets) {
      await prisma.asset.create({ data: a });
    }

    const aarav = await prisma.user.findUniqueOrThrow({ where: { email: "aarav@example.edu" } });
    const rahul = await prisma.user.findUniqueOrThrow({ where: { email: "rahul@example.edu" } });
    const priya = await prisma.user.findUniqueOrThrow({ where: { email: "priya@example.edu" } });

    const studentPortal = await prisma.asset.findUniqueOrThrow({ where: { code: "AST-001" } });
    const facultyPortal = await prisma.asset.findUniqueOrThrow({ where: { code: "AST-002" } });
    const librarySystem = await prisma.asset.findUniqueOrThrow({ where: { code: "AST-003" } });
    const repository = await prisma.asset.findUniqueOrThrow({ where: { code: "AST-004" } });

    // 5. Seed Access Grants (including out-of-role grant)
    const grants = [
      {
        userId: aarav.id,
        assetId: repository.id,
        accessLevel: "ADMIN",
        isExpected: false, // Intentional excessive access finding
      },
      {
        userId: rahul.id,
        assetId: studentPortal.id,
        accessLevel: "READ",
        isExpected: true,
      },
      {
        userId: priya.id,
        assetId: librarySystem.id,
        accessLevel: "READ",
        isExpected: true,
      },
      {
        userId: priya.id,
        assetId: facultyPortal.id,
        accessLevel: "WRITE",
        isExpected: true,
      },
    ];

    for (const g of grants) {
      await prisma.accessGrant.create({ data: g });
    }

    // 6. Seed Baseline Risk Findings
    const findings = [
      {
        findingCode: "RSK-024",
        title: "Excessive access permissions",
        description: "A faculty account holds unexpected administrative access to the Research Repository.",
        category: "ACCESS_CONTROL",
        likelihood: 4,
        impact: 5,
        score: 20,
        severity: "CRITICAL",
        userId: aarav.id,
        assetId: repository.id,
      },
      {
        findingCode: "RSK-023",
        title: "Overdue access review",
        description: "A scheduled access review has not been completed for the Library System.",
        category: "ACCESS_REVIEW",
        likelihood: 3,
        impact: 3,
        score: 9,
        severity: "MEDIUM",
        userId: priya.id,
        assetId: librarySystem.id,
      },
      {
        findingCode: "RSK-022",
        title: "Unusual access pattern",
        description: "Repeated failed login attempts were recorded for a demonstration account.",
        category: "SUSPICIOUS_ACTIVITY",
        likelihood: 4,
        impact: 3,
        score: 12,
        severity: "HIGH",
        userId: rahul.id,
        assetId: studentPortal.id,
      },
      {
        findingCode: "RSK-021",
        title: "Access review pending",
        description: "A routine review of faculty portal permissions is pending.",
        category: "ACCESS_REVIEW",
        likelihood: 2,
        impact: 2,
        score: 4,
        severity: "LOW",
        userId: priya.id,
        assetId: facultyPortal.id,
      },
    ];

    for (const f of findings) {
      await prisma.riskFinding.create({ data: f });
    }

    // 7. Seed Initial Telemetry Activity Logs
    const logs = [
      {
        action: "RISK_IDENTIFIED",
        description: "Unexpected administrative access identified on Research Repository.",
        eventType: "RISK",
        userId: aarav.id,
        assetId: repository.id,
      },
      {
        action: "ACCESS_REVIEW",
        description: "Library System access review is pending.",
        eventType: "REVIEW",
        userId: priya.id,
        assetId: librarySystem.id,
      },
      {
        action: "FAILED_LOGIN",
        description: "Simulated repeated failed login attempts from IP 192.168.10.45.",
        eventType: "AUTHENTICATION",
        userId: rahul.id,
        assetId: studentPortal.id,
      },
    ];

    for (const l of logs) {
      await prisma.activityLog.create({ data: l });
    }

    return NextResponse.json({
      success: true,
      message: "CampusTrust demo database has been reset to baseline factory state.",
    });
  } catch (error) {
    console.error("Database reset error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset demo database." },
      { status: 500 }
    );
  }
}

