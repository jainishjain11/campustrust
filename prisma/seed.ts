
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding CampusTrust database...");

    // Departments
    const departments = [
        { name: "Computer Science", code: "CSE" },
        { name: "Electronics", code: "ECE" },
        { name: "Administration", code: "ADM" },
        { name: "Library", code: "LIB" },
    ];

    for (const department of departments) {
        await prisma.department.upsert({
            where: { code: department.code },
            update: {},
            create: department,
        });
    }

    const cse = await prisma.department.findUniqueOrThrow({
        where: { code: "CSE" },
    });

    const ece = await prisma.department.findUniqueOrThrow({
        where: { code: "ECE" },
    });

    const admin = await prisma.department.findUniqueOrThrow({
        where: { code: "ADM" },
    });

    const library = await prisma.department.findUniqueOrThrow({
        where: { code: "LIB" },
    });

    // Users
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

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    // Digital assets
    const assets = [
        {
            name: "Student Portal",
            code: "AST-001",
            category: "Academic",
            criticality: 4,
        },
        {
            name: "Faculty Portal",
            code: "AST-002",
            category: "Academic",
            criticality: 4,
        },
        {
            name: "Library Management System",
            code: "AST-003",
            category: "Library",
            criticality: 3,
        },
        {
            name: "Research Repository",
            code: "AST-004",
            category: "Research",
            criticality: 5,
        },
        {
            name: "Hostel Management Portal",
            code: "AST-005",
            category: "Administration",
            criticality: 3,
        },
        {
            name: "Examination Management System",
            code: "AST-006",
            category: "Academic",
            criticality: 5,
        },
    ];

    for (const asset of assets) {
        await prisma.asset.upsert({
            where: { code: asset.code },
            update: {},
            create: asset,
        });
    }

    const aarav = await prisma.user.findUniqueOrThrow({
        where: { email: "aarav@example.edu" },
    });

    const rahul = await prisma.user.findUniqueOrThrow({
        where: { email: "rahul@example.edu" },
    });

    const priya = await prisma.user.findUniqueOrThrow({
        where: { email: "priya@example.edu" },
    });

    const repository = await prisma.asset.findUniqueOrThrow({
        where: { code: "AST-004" },
    });

    const studentPortal = await prisma.asset.findUniqueOrThrow({
        where: { code: "AST-001" },
    });

    const librarySystem = await prisma.asset.findUniqueOrThrow({
        where: { code: "AST-003" },
    });

    const facultyPortal = await prisma.asset.findUniqueOrThrow({
        where: { code: "AST-002" },
    });

    // Access grants
    const grants = [
        {
            userId: aarav.id,
            assetId: repository.id,
            accessLevel: "ADMIN",
            isExpected: false,
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

    for (const grant of grants) {
        await prisma.accessGrant.upsert({
            where: {
                userId_assetId: {
                    userId: grant.userId,
                    assetId: grant.assetId,
                },
            },
            update: {},
            create: grant,
        });
    }

    // Risk findings
    const findings = [
        {
            findingCode: "RSK-024",
            title: "Excessive access permissions",
            description:
                "A faculty account has unexpected administrative access to the Research Repository.",
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
            description:
                "A scheduled access review has not been completed for the Library System.",
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
            description:
                "Repeated failed login attempts were recorded for a demonstration account.",
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
            description:
                "A routine review of faculty portal permissions is pending.",
            category: "ACCESS_REVIEW",
            likelihood: 2,
            impact: 2,
            score: 4,
            severity: "LOW",
            userId: priya.id,
            assetId: facultyPortal.id,
        },
    ];

    for (const finding of findings) {
        await prisma.riskFinding.upsert({
            where: { findingCode: finding.findingCode },
            update: {},
            create: finding,
        });
    }

    // Activity logs
    const logs = [
        {
            action: "RISK_IDENTIFIED",
            description: "Unexpected administrative access identified.",
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
            description: "Simulated repeated failed login attempts.",
            eventType: "AUTHENTICATION",
            userId: rahul.id,
            assetId: studentPortal.id,
        },
    ];

    for (const log of logs) {
        const exists = await prisma.activityLog.findFirst({
            where: {
                action: log.action,
                userId: log.userId,
                assetId: log.assetId,
            },
        });

        if (!exists) {
            await prisma.activityLog.create({ data: log });
        }
    }

    console.log("CampusTrust demo data created successfully!");
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
