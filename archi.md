# CampusTrust --- Architecture Document

**Version:** 1.0\
**Architecture style:** Simple modular monolith\
**Recommended stack:** Next.js, TypeScript, Tailwind CSS, Prisma ORM and
SQLite

## 1. Architecture overview

CampusTrust will be a single Next.js application. The frontend pages,
server-side API routes and business logic live in one repository. Prisma
connects the application to a local SQLite database.

This architecture avoids the overhead of separate frontend and backend
deployments and is appropriate for a short academic project.

``` mermaid
flowchart TD
    A[Admin / Security Analyst] --> B[Next.js Web UI]
    B --> C[Server Actions / API Routes]
    C --> D[Authentication and RBAC]
    C --> E[Application Services]
    E --> F[Identity and Access Module]
    E --> G[Risk Assessment Engine]
    E --> H[Activity and Incident Module]
    E --> I[Reporting Module]
    F --> J[(SQLite Database)]
    G --> J
    H --> J
    I --> J
```

## 2. Technology choices

  -----------------------------------------------------------------------
  Layer                   Choice                  Reason
  ----------------------- ----------------------- -----------------------
  Full-stack framework    Next.js + TypeScript    One project for UI and
                                                  server endpoints

  Styling                 Tailwind CSS            Fast responsive
                                                  interface development

  UI components           shadcn/ui               Consistent tables,
                                                  dialogs, forms and
                                                  cards

  Charts                  Recharts                Dashboard charts

  Icons                   Lucide React            Consistent icons

  ORM                     Prisma                  Typed database access
                                                  and migrations

  Database                SQLite                  No database server
                                                  setup required

  Validation              Zod                     Validate form and API
                                                  input

  Authentication          Auth.js or a simple     Role-aware sessions
                          secure demo login       

  Deployment              Local demo first;       Avoid deployment delays
                          Vercel if suitable      
  -----------------------------------------------------------------------

For a classroom prototype, local execution is sufficient. If deploying,
confirm that the chosen hosting environment supports the selected SQLite
persistence approach; do not assume a local SQLite file will persist on
serverless hosting.

## 3. Application layers

### A. Presentation layer

Responsibilities: - Render dashboard, user, asset, risk, activity and
incident pages. - Collect form input. - Display validation messages and
loading/empty states. - Hide actions that the current role cannot use.

Suggested route structure:

``` text
/login
/dashboard
/users
/users/[id]
/assets
/assets/[id]
/access
/risks
/risks/[id]
/activity
/incidents
/reports
```

### B. Server/API layer

Responsibilities: - Receive requests from the UI. - Validate input using
Zod. - Check authenticated user and role. - Call application services. -
Return structured results and errors.

Suggested API routes:

``` text
POST   /api/auth/login             # if using custom demo auth
GET    /api/dashboard
GET    /api/users
POST   /api/users
PATCH  /api/users/[id]
GET    /api/assets
POST   /api/assets
GET    /api/risks
POST   /api/risks/recalculate
GET    /api/activity
POST   /api/activity/simulate      # demo-only, admin restricted
GET    /api/incidents
POST   /api/incidents
PATCH  /api/incidents/[id]
GET    /api/reports/risks.csv
```

Next.js Server Actions may be used instead of REST endpoints for simple
forms. Choose one approach consistently; do not build both for the same
operation.

### C. Business logic layer

Keep domain logic out of page components.

Suggested services:

``` text
identity.service.ts
asset.service.ts
access.service.ts
risk-engine.service.ts
activity.service.ts
incident.service.ts
report.service.ts
```

The risk engine should accept user, asset, access and activity data and
return findings. It should not directly depend on React components.

### D. Data layer

Prisma schema maps application entities to SQLite tables. Use Prisma
migrations to create and update the database. Seed the database with
fictional departments, users, roles, assets, access records and
simulated events.

## 4. Suggested folder structure

``` text
campustrust/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── assets/
│   │   │   ├── access/
│   │   │   ├── risks/
│   │   │   ├── activity/
│   │   │   ├── incidents/
│   │   │   └── reports/
│   │   └── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── assets/
│   │   ├── risks/
│   │   └── incidents/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── validation/
│   │   └── permissions.ts
│   ├── services/
│   │   ├── identity.service.ts
│   │   ├── asset.service.ts
│   │   ├── access.service.ts
│   │   ├── risk-engine.service.ts
│   │   ├── activity.service.ts
│   │   ├── incident.service.ts
│   │   └── report.service.ts
│   └── types/
├── spec.md
├── archi.md
├── package.json
└── README.md
```

This is a target structure, not a requirement to create every file on
day one. Start with the minimum pages and add folders as needed.

## 5. Data model and relationships

``` mermaid
erDiagram
    DEPARTMENT ||--o{ USER : contains
    DEPARTMENT ||--o{ ASSET : owns
    ROLE ||--o{ USER : assigned_to
    ROLE ||--o{ ROLE_ASSET_PERMISSION : defines
    ASSET ||--o{ ROLE_ASSET_PERMISSION : permits
    USER ||--o{ USER_ASSET_ACCESS : receives
    ASSET ||--o{ USER_ASSET_ACCESS : grants
    USER ||--o{ ACTIVITY_LOG : generates
    ASSET ||--o{ ACTIVITY_LOG : relates_to
    USER ||--o{ RISK_FINDING : associated_with
    ASSET ||--o{ RISK_FINDING : affects
    RISK_FINDING ||--o{ INCIDENT : creates
    USER ||--o{ INCIDENT : assigned_to
    USER ||--o{ AUDIT_LOG : performs
```

Recommended core tables:

  Table                 Purpose
  --------------------- -------------------------------------
  Department            Academic/administrative departments
  Role                  Student, Faculty, Analyst, Admin
  User                  Fictional university identities
  Asset                 University digital applications
  RoleAssetPermission   Expected access for each role
  UserAssetAccess       Actual access assigned to a user
  ActivityLog           Simulated security events
  RiskFinding           Results from risk assessment
  Incident              Remediation workflow
  AuditLog              History of important changes

Use enums or validated strings for statuses and permission types. Add
indexes to frequently filtered fields such as departmentId, severity,
status and eventTime if needed.

## 6. Risk assessment engine

### Inputs

-   User status, role and department.
-   User's actual asset access.
-   Expected role-to-asset permissions.
-   Asset criticality and data sensitivity.
-   Relevant simulated activity events.
-   Last access review date.

### Processing

For each applicable rule: 1. Check whether its condition is true. 2.
Identify affected user and asset. 3. Set likelihood and impact from the
rule and asset attributes. 4. Calculate `score = likelihood * impact`.
5. Map score to severity. 6. Create or update a finding with a clear
explanation and recommendation.

### Initial rule examples

  -----------------------------------------------------------------------
  Rule                    Condition               Example recommendation
  ----------------------- ----------------------- -----------------------
  ID-01                   Inactive identity still Deactivate after owner
                          enabled                 verification

  AC-01                   User has access outside Review and remove
                          expected role           unnecessary access
                          permissions             

  PR-01                   Privileged role has no  Require approval and
                          recorded justification  periodic review

  RV-01                   Access review is        Request owner
                          overdue                 recertification

  LG-01                   Multiple failed logins  Verify activity and
                          in a short window       review authentication
                                                  controls
  -----------------------------------------------------------------------

### Score mapping

``` text
score = likelihood * impact

1–4   -> Low
5–9   -> Medium
10–16 -> High
17–25 -> Critical
```

The risk engine should be deterministic so the same input produces the
same result. Avoid presenting a rule-based score as an AI prediction.

### Avoid duplicate findings

Give each finding a stable rule code and a reference to the affected
user/asset. On recalculation, update an existing open finding instead of
inserting duplicates every time. Resolved findings should remain in the
history.

## 7. Authorization design

Enforce authorization in server-side functions or route handlers. Hiding
a button in the frontend is not security.

Example permission matrix:

  Action                        Admin   Analyst      Dept Manager      Viewer
  --------------------------- ------- --------- ----------------- -----------
  View dashboard                  Yes       Yes               Yes         Yes
  Manage users/assets             Yes        No                No          No
  View all risks                  Yes       Yes                No         Yes
  View own department risks       Yes       Yes               Yes         Yes
  Recalculate risks               Yes       Yes                No          No
  Assign/update incidents         Yes       Yes     Assigned only          No
  Export reports                  Yes       Yes   Department only   View only

For the fastest MVP, implement Admin and Analyst fully, then add the
other roles if time allows.

## 8. Key workflows

### Workflow A --- Assess identity access risk

``` mermaid
flowchart TD
    A[Admin opens Risk Assessment] --> B[Load users, assets and permissions]
    B --> C[Run assessment rules]
    C --> D{Risk condition found?}
    D -- No --> E[No new finding]
    D -- Yes --> F[Calculate likelihood x impact]
    F --> G[Assign severity]
    G --> H[Save or update finding]
    H --> I[Refresh dashboard]
```

### Workflow B --- Mitigate a finding

``` mermaid
flowchart TD
    A[Finding appears in risk register] --> B[Analyst reviews details]
    B --> C[Assign owner and due date]
    C --> D[Status: In Progress]
    D --> E[Record remediation notes]
    E --> F[Verify corrective action]
    F --> G[Resolve or keep open]
    G --> H[Update management dashboard]
```

### Workflow C --- Simulated suspicious activity

``` mermaid
flowchart TD
    A[Generate demo activity event] --> B[Store event as simulated]
    B --> C[Check activity rules]
    C --> D{Suspicious pattern?}
    D -- No --> E[Keep in activity history]
    D -- Yes --> F[Create alert / finding]
    F --> G[Analyst reviews]
    G --> H[Create incident if required]
```

## 9. Dashboard data

The dashboard should calculate: - Total registered identities. - Active
and inactive identities. - Total registered digital assets. - Open
findings. - Critical and high findings. - Findings by severity. -
Findings by department. - Incidents by status. - Overdue mitigation
actions. - Recent simulated activity alerts.

Do not hardcode dashboard counts. Query them from the database.

## 10. Seed/demo dataset

Create a small, believable fictional dataset: - 4 departments: Computer
Science, Electronics, Administration, Library. - 4 roles: Student,
Faculty, Security Analyst, Administrator. - 12--20 fictional users. -
5--7 fictional digital assets: Student Portal, Faculty Portal, Library
System, Research Repository, Hostel Portal, Exam Management System. - A
few role-to-asset permission rules. - 15--30 simulated activity
events. - At least 5 intentionally seeded risk findings.

Use clearly fictional names and email domains such as `example.edu`.
Never import actual student lists or real credentials.

## 11. Error handling and auditability

-   Validate all input on the server.
-   Return clear messages for missing or invalid records.
-   Prevent unauthorized role changes.
-   Record who created or updated a finding or incident.
-   Preserve resolved findings for reporting.
-   Mark simulated events visibly in the interface.
-   Do not log passwords, session tokens or sensitive secrets.

## 12. Build order

1.  Create the Next.js project and install UI/database dependencies.
2.  Create Prisma schema and SQLite database.
3.  Seed demo departments, roles, users and assets.
4.  Build the application shell and login.
5.  Build users and assets CRUD.
6.  Build access mapping.
7.  Implement and test risk rules.
8.  Build risk register and dashboard.
9.  Build activity log and incident workflow.
10. Add CSV report export.
11. Test the demo scenario and prepare screenshots.

Build a complete vertical slice early: one seeded user, one asset, one
access rule, one risk finding and one incident. Then expand the dataset
and screens.

## 13. Testing checklist

-   Admin can log in and analyst cannot access admin-only actions.
-   User can be created, edited and deactivated.
-   Asset can be created and assigned an owner department.
-   Expected role permissions can be compared with actual access.
-   Each risk rule produces the expected finding.
-   Risk score and severity match the documented formula.
-   Recalculation does not create duplicate open findings.
-   An incident can be assigned and resolved.
-   Dashboard counts update after changes.
-   CSV export matches selected filters.
-   All sample records and simulated events are clearly fictional.

## 14. Live demo script

1.  Sign in as Admin.
2.  Show the dashboard and seeded campus-style data.
3.  Open a fictional faculty account that has moved departments.
4.  Show that the account still has access to an old department's
    restricted asset.
5.  Run risk assessment and show the generated finding.
6.  Explain the likelihood, impact and risk score.
7.  Assign a remediation task to the Security Analyst.
8.  Sign in as Analyst and resolve the task with a note.
9.  Return to the dashboard and show the updated risk status.
10. Export the risk register.

**Presentation message:** CampusTrust does not replace a university's
existing portals or identity provider. It is a management layer that
helps authorized university stakeholders understand identity/access
risks and coordinate their remediation.
