import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding CampusTrust database...");

    // 1. Departments
    const departments = [
        { name: "Computer Science", code: "CSE", description: "Department of Computer Science & Engineering" },
        { name: "Electronics", code: "ECE", description: "Department of Electronics & Communication" },
        { name: "Administration", code: "ADM", description: "University Central Administration & IT Services" },
        { name: "Library", code: "LIB", description: "University Central Library & Learning Resources" },
    ];

    for (const department of departments) {
        await prisma.department.upsert({
            where: { code: department.code },
            update: {
                name: department.name,
                description: department.description,
            },
            create: department,
        });
    }

    const cse = await prisma.department.findUniqueOrThrow({ where: { code: "CSE" } });
    const ece = await prisma.department.findUniqueOrThrow({ where: { code: "ECE" } });
    const admin = await prisma.department.findUniqueOrThrow({ where: { code: "ADM" } });
    const library = await prisma.department.findUniqueOrThrow({ where: { code: "LIB" } });

    // 2. Demo Users (16 total fictional university personas across departments)
    const users = [
        // Administration (Admin & Security Analysts)
        {
            fullName: "Campus Administrator",
            email: "admin@example.edu",
            role: "ADMIN",
            status: "ACTIVE",
            departmentId: admin.id,
        },
        {
            fullName: "Tariq Mansoor",
            email: "tariq.mansoor@example.edu",
            role: "ADMIN",
            status: "INACTIVE",
            departmentId: admin.id,
        },
        {
            fullName: "Security Analyst",
            email: "analyst@example.edu",
            role: "SECURITY_ANALYST",
            status: "ACTIVE",
            departmentId: admin.id,
        },
        {
            fullName: "Divya Menon",
            email: "divya.menon@example.edu",
            role: "SECURITY_ANALYST",
            status: "ACTIVE",
            departmentId: admin.id,
        },

        // Department Managers
        {
            fullName: "Dr. Vikram Sen",
            email: "vikram.sen@example.edu",
            role: "DEPARTMENT_MANAGER",
            status: "ACTIVE",
            departmentId: cse.id,
        },
        {
            fullName: "Meera Krishnan",
            email: "meera.krishnan@example.edu",
            role: "DEPARTMENT_MANAGER",
            status: "ACTIVE",
            departmentId: ece.id,
        },
        {
            fullName: "Sunita Rao",
            email: "sunita.rao@example.edu",
            role: "DEPARTMENT_MANAGER",
            status: "ACTIVE",
            departmentId: library.id,
        },

        // Faculty
        {
            fullName: "Aarav Sharma",
            email: "aarav@example.edu",
            role: "FACULTY",
            status: "ACTIVE",
            departmentId: cse.id,
        },
        {
            fullName: "Priya Nair",
            email: "priya@example.edu",
            role: "FACULTY",
            status: "ACTIVE",
            departmentId: ece.id,
        },
        {
            fullName: "Rajesh Gupta",
            email: "rajesh.gupta@example.edu",
            role: "FACULTY",
            status: "INACTIVE",
            departmentId: cse.id,
        },
        {
            fullName: "Dr. Kavita Deshmukh",
            email: "kavita.deshmukh@example.edu",
            role: "FACULTY",
            status: "ACTIVE",
            departmentId: ece.id,
        },

        // Students
        {
            fullName: "Rahul Mehta",
            email: "rahul@example.edu",
            role: "STUDENT",
            status: "ACTIVE",
            departmentId: cse.id,
        },
        {
            fullName: "Ananya Verma",
            email: "ananya@example.edu",
            role: "STUDENT",
            status: "ACTIVE",
            departmentId: library.id,
        },
        {
            fullName: "Rohan Joshi",
            email: "rohan.joshi@example.edu",
            role: "STUDENT",
            status: "ACTIVE",
            departmentId: cse.id,
        },
        {
            fullName: "Sneha Patel",
            email: "sneha.patel@example.edu",
            role: "STUDENT",
            status: "INACTIVE",
            departmentId: ece.id,
        },
        {
            fullName: "Arjun Reddy",
            email: "arjun.reddy@example.edu",
            role: "STUDENT",
            status: "ACTIVE",
            departmentId: cse.id,
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                fullName: user.fullName,
                role: user.role,
                status: user.status,
                departmentId: user.departmentId,
            },
            create: user,
        });
    }

    // 3. Digital Assets
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

    for (const asset of assets) {
        await prisma.asset.upsert({
            where: { code: asset.code },
            update: {
                name: asset.name,
                category: asset.category,
                criticality: asset.criticality,
                description: asset.description,
            },
            create: asset,
        });
    }

    // Fetch user references for grants, risks, and activity logs
    const [
        aarav, priya, rahul, ananya, analyst, adminUser,
        tariq, divya, vikram, meera, sunita, rajesh, kavita, rohan, sneha, arjun
    ] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { email: "aarav@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "priya@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "rahul@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "ananya@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "analyst@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "admin@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "tariq.mansoor@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "divya.menon@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "vikram.sen@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "meera.krishnan@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "sunita.rao@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "rajesh.gupta@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "kavita.deshmukh@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "rohan.joshi@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "sneha.patel@example.edu" } }),
        prisma.user.findUniqueOrThrow({ where: { email: "arjun.reddy@example.edu" } }),
    ]);

    const [
        studentPortal, facultyPortal, librarySystem,
        repository, hostelPortal, examSystem
    ] = await Promise.all([
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-001" } }),
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-002" } }),
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-003" } }),
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-004" } }),
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-005" } }),
        prisma.asset.findUniqueOrThrow({ where: { code: "AST-006" } }),
    ]);

    // 4. Access Grants (including realistic permissions & intentional security mismatches)
    const grants = [
        // Baseline original grants
        {
            userId: aarav.id,
            assetId: repository.id,
            accessLevel: "ADMIN",
            isExpected: false, // Intentional excessive out-of-role access
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

        // Department Managers & Faculty
        {
            userId: vikram.id,
            assetId: facultyPortal.id,
            accessLevel: "WRITE",
            isExpected: true,
        },
        {
            userId: vikram.id,
            assetId: examSystem.id,
            accessLevel: "ADMIN",
            isExpected: false, // Intentional mismatch: uncertified exam administration
        },
        {
            userId: meera.id,
            assetId: facultyPortal.id,
            accessLevel: "WRITE",
            isExpected: true,
        },
        {
            userId: sunita.id,
            assetId: librarySystem.id,
            accessLevel: "ADMIN",
            isExpected: true,
        },
        {
            userId: kavita.id,
            assetId: facultyPortal.id,
            accessLevel: "WRITE",
            isExpected: true,
        },
        {
            userId: kavita.id,
            assetId: repository.id,
            accessLevel: "WRITE",
            isExpected: true,
        },

        // Students & Assistants
        {
            userId: ananya.id,
            assetId: librarySystem.id,
            accessLevel: "WRITE",
            isExpected: true,
        },
        {
            userId: rohan.id,
            assetId: studentPortal.id,
            accessLevel: "READ",
            isExpected: true,
        },
        {
            userId: rohan.id,
            assetId: repository.id,
            accessLevel: "READ",
            isExpected: true,
        },
        {
            userId: arjun.id,
            assetId: hostelPortal.id,
            accessLevel: "ADMIN",
            isExpected: false, // Intentional mismatch: student with administrative privileges
        },

        // Inactive identities with lingering active grants (Intentional Lifecycle Mismatches)
        {
            userId: rajesh.id,
            assetId: repository.id,
            accessLevel: "READ",
            isExpected: true, // Lingering grant for inactive faculty
        },
        {
            userId: sneha.id,
            assetId: studentPortal.id,
            accessLevel: "READ",
            isExpected: true, // Lingering grant for inactive student
        },
        {
            userId: tariq.id,
            assetId: examSystem.id,
            accessLevel: "ADMIN",
            isExpected: true, // Lingering admin grant for suspended admin
        },

        // Administrative & Security
        {
            userId: adminUser.id,
            assetId: examSystem.id,
            accessLevel: "ADMIN",
            isExpected: true,
        },
        {
            userId: analyst.id,
            assetId: repository.id,
            accessLevel: "READ",
            isExpected: true,
        },
        {
            userId: divya.id,
            assetId: studentPortal.id,
            accessLevel: "READ",
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
            update: {
                accessLevel: grant.accessLevel,
                isExpected: grant.isExpected,
            },
            create: grant,
        });
    }

    // 5. Baseline Risk Findings
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
        {
            findingCode: "RSK-025",
            title: "Suspended administrator retains exam system control",
            description: "Inactive administrator Tariq Mansoor holds active ADMIN rights on Examination Management System.",
            category: "IDENTITY_LIFECYCLE",
            likelihood: 4,
            impact: 5,
            score: 20,
            severity: "CRITICAL",
            userId: tariq.id,
            assetId: examSystem.id,
        },
        {
            findingCode: "RSK-026",
            title: "Inactive faculty retains research repository access",
            description: "Rajesh Gupta is on inactive sabbatical leave but retains active access to Research Repository.",
            category: "IDENTITY_LIFECYCLE",
            likelihood: 4,
            impact: 4,
            score: 16,
            severity: "HIGH",
            userId: rajesh.id,
            assetId: repository.id,
        },
        {
            findingCode: "RSK-027",
            title: "Excessive administrative privilege assigned to student",
            description: "Undergraduate student Arjun Reddy holds administrative rights on Hostel Management Portal.",
            category: "PRIVILEGED_ACCESS",
            likelihood: 4,
            impact: 4,
            score: 16,
            severity: "HIGH",
            userId: arjun.id,
            assetId: hostelPortal.id,
        },
        {
            findingCode: "RSK-028",
            title: "Uncertified departmental administrative escalation",
            description: "Dr. Vikram Sen holds uncertified administrative rights over Examination Management System.",
            category: "ACCESS_CONTROL",
            likelihood: 4,
            impact: 5,
            score: 20,
            severity: "CRITICAL",
            userId: vikram.id,
            assetId: examSystem.id,
        },
        {
            findingCode: "RSK-029",
            title: "Alumni account retains active student portal access",
            description: "Graduated student Sneha Patel remains inactive with active access to Student Portal.",
            category: "IDENTITY_LIFECYCLE",
            likelihood: 3,
            impact: 3,
            score: 9,
            severity: "MEDIUM",
            userId: sneha.id,
            assetId: studentPortal.id,
        },
    ];

    for (const finding of findings) {
        await prisma.riskFinding.upsert({
            where: { findingCode: finding.findingCode },
            update: {
                title: finding.title,
                description: finding.description,
                category: finding.category,
                likelihood: finding.likelihood,
                impact: finding.impact,
                score: finding.score,
                severity: finding.severity,
                userId: finding.userId,
                assetId: finding.assetId,
            },
            create: finding,
        });
    }

    // 6. Activity Logs (Idempotent telemetry stream covering all required operational and security scenarios)
    const logs = [
        // Original baseline telemetry
        {
            action: "RISK_IDENTIFIED",
            description: "Unexpected administrative access identified.",
            eventType: "RISK",
            ipAddress: "10.0.2.14",
            userId: aarav.id,
            assetId: repository.id,
        },
        {
            action: "ACCESS_REVIEW",
            description: "Library System access review is pending.",
            eventType: "REVIEW",
            ipAddress: "10.0.30.1",
            userId: priya.id,
            assetId: librarySystem.id,
        },
        {
            action: "FAILED_LOGIN",
            description: "Simulated repeated failed login attempts.",
            eventType: "AUTHENTICATION",
            ipAddress: "192.168.10.45",
            userId: rahul.id,
            assetId: studentPortal.id,
        },

        // Category 1: Successful and Failed Logins
        {
            action: "SUCCESSFUL_LOGIN",
            description: "Single Sign-On (SSO) authentication successful for Dr. Vikram Sen via Campus SAML IdP.",
            eventType: "AUTHENTICATION",
            ipAddress: "10.0.14.22",
            userId: vikram.id,
            assetId: facultyPortal.id,
        },
        {
            action: "FAILED_LOGIN",
            description: "Failed login attempt: Multiple invalid credential challenges detected for suspended identity Tariq Mansoor.",
            eventType: "AUTHENTICATION",
            ipAddress: "198.51.100.41",
            userId: tariq.id,
            assetId: examSystem.id,
        },
        {
            action: "FAILED_LOGIN",
            description: "MFA challenge timeout during login attempt for Dr. Kavita Deshmukh.",
            eventType: "AUTHENTICATION",
            ipAddress: "172.16.8.55",
            userId: kavita.id,
            assetId: facultyPortal.id,
        },

        // Category 2: Off-Hours Access
        {
            action: "OFF_HOURS_ACCESS",
            description: "Unusual off-hours access: Student account Arjun Reddy authenticated to Hostel Management Portal at 02:47 AM.",
            eventType: "SUSPICIOUS_ACTIVITY",
            ipAddress: "10.0.99.12",
            userId: arjun.id,
            assetId: hostelPortal.id,
        },
        {
            action: "OFF_HOURS_ACCESS",
            description: "Late-night repository sync detected: Research data download initiated by Aarav Sharma at 03:15 AM.",
            eventType: "SUSPICIOUS_ACTIVITY",
            ipAddress: "192.168.1.18",
            userId: aarav.id,
            assetId: repository.id,
        },

        // Category 3: Sensitive Asset Access
        {
            action: "SENSITIVE_ACCESS",
            description: "High-criticality asset accessed: Dr. Vikram Sen inspected department grade rosters on Examination Management System.",
            eventType: "ACCESS",
            ipAddress: "10.0.14.22",
            userId: vikram.id,
            assetId: examSystem.id,
        },
        {
            action: "SENSITIVE_ACCESS",
            description: "Confidential pre-publication research query executed on Research Repository by Dr. Kavita Deshmukh.",
            eventType: "ACCESS",
            ipAddress: "172.16.8.55",
            userId: kavita.id,
            assetId: repository.id,
        },
        {
            action: "SENSITIVE_ACCESS",
            description: "Administrative audit: Campus Administrator reviewed root access logs on Examination Management System.",
            eventType: "ACCESS",
            ipAddress: "10.0.2.1",
            userId: adminUser.id,
            assetId: examSystem.id,
        },

        // Category 4: Permission Changes and Privilege Escalation
        {
            action: "PRIVILEGE_ESCALATION",
            description: "Privilege escalation detected: Student Arjun Reddy provisioned uncertified administrative role on Hostel Management Portal.",
            eventType: "SUSPICIOUS_ACTIVITY",
            ipAddress: "10.0.2.15",
            userId: arjun.id,
            assetId: hostelPortal.id,
        },
        {
            action: "PERMISSION_CHANGED",
            description: "Entitlement elevated: Write permissions provisioned for Library Management System to student assistant Ananya Verma.",
            eventType: "ACCESS",
            ipAddress: "10.0.30.5",
            userId: ananya.id,
            assetId: librarySystem.id,
        },
        {
            action: "PERMISSION_CHANGED",
            description: "Role entitlement updated: Department Manager Meera Krishnan certified department access on Faculty Portal.",
            eventType: "ACCESS",
            ipAddress: "10.0.12.8",
            userId: meera.id,
            assetId: facultyPortal.id,
        },

        // Category 5: Account Status Changes
        {
            action: "ACCOUNT_STATUS_CHANGE",
            description: "Identity lifecycle transition: Account status updated to INACTIVE for Tariq Mansoor upon administrative offboarding.",
            eventType: "ACCESS",
            ipAddress: "10.0.2.1",
            userId: tariq.id,
            assetId: null,
        },
        {
            action: "ACCOUNT_STATUS_CHANGE",
            description: "Faculty lifecycle update: Rajesh Gupta marked INACTIVE due to approved sabbatical leave.",
            eventType: "ACCESS",
            ipAddress: "10.0.2.1",
            userId: rajesh.id,
            assetId: null,
        },
        {
            action: "ACCOUNT_STATUS_CHANGE",
            description: "Student lifecycle transition: Sneha Patel marked INACTIVE following degree completion.",
            eventType: "ACCESS",
            ipAddress: "10.0.2.1",
            userId: sneha.id,
            assetId: null,
        },

        // Category 6: Access Reviews and SSO Events
        {
            action: "ACCESS_REVIEW",
            description: "Periodic access review completed: Sunita Rao certified all active staff access to Library Management System.",
            eventType: "REVIEW",
            ipAddress: "10.0.30.1",
            userId: sunita.id,
            assetId: librarySystem.id,
        },
        {
            action: "SSO_EVENT",
            description: "Single Sign-On federation handshake completed: OAuth2 Bearer token generated for Security Analyst Divya Menon.",
            eventType: "AUTHENTICATION",
            ipAddress: "10.0.2.8",
            userId: divya.id,
            assetId: null,
        },
    ];

    for (const log of logs) {
        const exists = await prisma.activityLog.findFirst({
            where: {
                action: log.action,
                description: log.description,
            },
        });

        if (!exists) {
            await prisma.activityLog.create({ data: log });
        }
    }

    console.log("CampusTrust demo data expanded and seeded successfully!");
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });