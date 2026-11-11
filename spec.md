# CampusTrust --- Project Specification

**Project title:** CampusTrust --- University Digital Identity & Access
Risk Management System\
**Course:** Management Information System (MIS)\
**Case-study environment:** SRM Institute of Science and Technology,
Kattankulathur (SRMIST KTR)\
**Document version:** 1.0\
**Project type:** Academic prototype using fictional data

## 1. Project summary

CampusTrust is a web-based Management Information System that helps
university administrators assess and manage cybersecurity risks related
to digital identities and access permissions.

Universities have multiple user groups---students, faculty, department
coordinators and administrators---who require different levels of access
to academic and administrative applications. If accounts remain active
after a role change, users receive excessive permissions, or suspicious
account activity is not reviewed, sensitive information may be exposed.

CampusTrust provides one place to maintain a simulated inventory of
users and digital systems, assess identity and access risks, review
alerts, assign remediation actions and view management reports.

**Important scope boundary:** This is a standalone academic prototype.
It will use fictional sample data and simulated security events. It will
not connect to SRMIST production systems, collect real credentials, scan
campus networks or claim that SRMIST has the vulnerabilities shown in
the demo.

## 2. Problem statement

Universities manage digital identities across academic, administrative
and research services. User roles and access requirements can change
over time, creating risks such as inactive accounts, excessive
privileges, conflicting permissions and suspicious login activity. When
identity information, access reviews and security alerts are managed
separately, administrators may lack a consolidated view of the
institution's exposure and the actions needed to reduce it.

There is a need for a centralized Management Information System that
records university users and digital assets, evaluates identity-related
cybersecurity risks, prioritizes findings, and tracks mitigation actions
through to closure.

## 3. Aim and objectives

### Aim

To design and implement a simple university-focused cybersecurity risk
assessment and management information system for digital identity and
access risks.

### Objectives

1.  Maintain a structured inventory of users, departments, roles and
    digital applications.
2.  Define role-based access permissions for the prototype.
3.  identify risky identity conditions such as inactive accounts and
    excessive privileges.
4.  Calculate transparent risk scores using likelihood and impact.
5.  Display risks through dashboards, tables and a risk heatmap.
6.  Record simulated suspicious activities and generate review alerts.
7.  Assign mitigation actions to responsible administrators and track
    their status.
8.  Provide management reports that summarize risk levels and
    remediation progress.

## 4. Intended users and roles

  -----------------------------------------------------------------------
  Role                                Main permissions
  ----------------------------------- -----------------------------------
  System Administrator                Manage users, roles, assets, risk
                                      rules and all incidents

  Security Analyst                    Review risk findings, investigate
                                      alerts and create mitigation
                                      actions

  Department Manager                  View department-level risks and
                                      update assigned actions

  Read-only Viewer                    View dashboard and reports without
                                      changing records
  -----------------------------------------------------------------------

For a short assignment, implement Admin and Analyst first. Department
Manager and Viewer can be represented through role-based demo accounts
if time permits.

## 5. Scope

### In scope --- minimum viable product (MVP)

-   Demo login with seeded accounts and role-based navigation.
-   Dashboard with total users, assets, open risks, critical risks and
    overdue actions.
-   User directory with create, edit, deactivate and search functions.
-   Department and role assignment.
-   Digital application/asset inventory.
-   Access-risk rules and automatic risk findings.
-   Risk score, severity and recommended action.
-   Simulated activity log viewer.
-   Incident/mitigation task workflow.
-   Basic reports and CSV export.

### Optional enhancements --- only if time remains

-   PDF report generation.
-   Email notifications.
-   More detailed permission matrix.
-   Risk trend charts and historical snapshots.
-   AI-generated plain-language recommendations. These must be advisory
    and based on the finding data; they are not required for the MVP.

### Out of scope

-   Integration with actual SRMIST login, ERP, attendance, library or
    Wi-Fi systems.
-   Real network monitoring, penetration testing or vulnerability
    scanning.
-   Collection or storage of real student/faculty passwords.
-   Automated blocking or disabling of real accounts.
-   Claims of regulatory certification or production-grade security.

## 6. Core modules and functional requirements

### Module A --- Authentication and role-based access

-   FR-01: A demo user can sign in using a seeded account.
-   FR-02: The system identifies the user's role.
-   FR-03: Pages and actions are restricted according to role.
-   FR-04: Users can sign out.
-   Demo accounts should use documented sample credentials and must not
    be reused for real services.

### Module B --- Dashboard

-   FR-05: Show total users, active users, registered assets, open risks
    and critical risks.
-   FR-06: Show risk distribution by severity.
-   FR-07: Show risks by department.
-   FR-08: Show recent alerts and overdue mitigation actions.
-   FR-09: Dashboard values must be calculated from database records,
    not hardcoded.

### Module C --- User and identity management

-   FR-10: List users with name, fictional university ID, email,
    department, role and status.
-   FR-11: Create, edit and deactivate demo users.
-   FR-12: Search and filter by department, role and status.
-   FR-13: Record a user's role or department change.
-   FR-14: Flag active accounts that have been marked as inactive or
    whose access review is overdue.

### Module D --- Application and asset inventory

-   FR-15: Register applications such as Student Portal, Faculty Portal,
    Library System and Research Repository as fictional demo assets.
-   FR-16: Store asset owner, department, criticality and data
    sensitivity.
-   FR-17: Define which roles should have access to each asset.
-   FR-18: View users and roles associated with each asset.

### Module E --- Risk assessment engine

-   FR-19: Evaluate identity and access records against a small set of
    transparent rules.
-   FR-20: Calculate likelihood, impact and risk score.
-   FR-21: Assign severity: Low, Medium, High or Critical.
-   FR-22: Show the reason for each finding and a recommended
    mitigation.
-   FR-23: Recalculate findings when relevant user, role or asset
    information changes.

**Initial risk rules** 1. Inactive account still marked active:
likelihood 4, impact based on asset sensitivity. 2. User has access to
an asset outside their assigned role: likelihood 4, impact based on
asset criticality. 3. User has privileged administrator access without a
documented business reason: likelihood 3, impact 5. 4. Account has not
been reviewed within the configured review period: likelihood 3, impact
based on asset criticality. 5. Repeated failed login events in a short
simulated period: likelihood 4, impact based on asset criticality.

These are prototype rules, not proof that an account has been
compromised.

**Risk formula** - Likelihood: 1--5. - Impact: 1--5. - Risk score =
Likelihood × Impact (range 1--25).

Suggested severity bands: - 1--4: Low - 5--9: Medium - 10--16: High -
17--25: Critical

### Module F --- Activity monitoring

-   FR-24: Display simulated login and access events.
-   FR-25: Support event types such as successful login, failed login,
    access denied and role change.
-   FR-26: Flag predefined suspicious patterns, such as repeated failed
    logins.
-   FR-27: Link relevant alerts to a user and an asset where possible.
-   FR-28: Clearly label all generated events as simulated.

### Module G --- Incident and mitigation management

-   FR-29: Create a finding or alert as an incident.
-   FR-30: Assign an owner and due date.
-   FR-31: Track status: Open, In Progress, Resolved or Accepted.
-   FR-32: Store remediation notes and closure details.
-   FR-33: Show overdue actions.
-   FR-34: Keep a simple audit trail of important changes.

### Module H --- Reports

-   FR-35: Filter risks by severity, department, asset and status.
-   FR-36: Show open versus resolved findings.
-   FR-37: Export a filtered risk register as CSV.
-   FR-38: Show a report date and clearly identify prototype/demo data.

## 7. Non-functional requirements

-   Usability: clear navigation and readable dashboard labels.
-   Performance: normal pages should load quickly with a small demo
    dataset.
-   Data integrity: use database relations and validation.
-   Security: hash passwords if credentials are stored; enforce
    authorization on the server, not only in the UI.
-   Privacy: use fictional records only.
-   Maintainability: keep risk rules and scoring logic in a separate
    module.
-   Reliability: show useful error and empty states.
-   Accessibility: use readable contrast, labels and keyboard-friendly
    controls.

## 8. Risk assessment methodology

CampusTrust uses a simplified qualitative risk assessment:

1.  Identify an identity, access or activity condition.
2.  Identify the affected user and/or digital asset.
3.  Estimate likelihood from the rule.
4.  Estimate impact from asset criticality and data sensitivity.
5.  Calculate score = likelihood × impact.
6.  Map the score to a severity band.
7.  Recommend a control and create a mitigation task.
8.  Reassess after the task is completed.

This is an educational scoring model. It should be described as a
prototype methodology, not as a formal audit or certification.

## 9. Main screens

1.  Login
2.  Dashboard
3.  Users
4.  User details
5.  Applications / Assets
6.  Access matrix
7.  Risk register
8.  Risk details
9.  Activity logs
10. Incidents / Mitigation tasks
11. Reports
12. Settings / Demo data reset (admin only)

## 10. Suggested database entities

-   User: id, name, universityId, email, departmentId, roleId, status,
    lastReviewAt, createdAt
-   Department: id, name
-   Role: id, name, description
-   Asset: id, name, type, ownerDepartmentId, criticality,
    dataSensitivity, description
-   RoleAssetPermission: id, roleId, assetId, permission
-   UserAssetAccess: id, userId, assetId, permission, approvedBy,
    approvedAt
-   ActivityLog: id, userId, assetId, eventType, eventTime, sourceLabel,
    details, isSimulated
-   RiskFinding: id, userId, assetId, ruleCode, title, description,
    likelihood, impact, score, severity, status, recommendation,
    detectedAt
-   Incident: id, findingId, assignedToId, dueDate, status, notes,
    resolvedAt
-   AuditLog: id, actorUserId, action, entityType, entityId, details,
    createdAt

For a very short build, combine RoleAssetPermission and UserAssetAccess
into a single Access record if necessary.

## 11. Acceptance criteria

The MVP is ready for demonstration when: - A demo administrator can log
in. - The dashboard displays values calculated from seeded database
records. - An administrator can create or deactivate a fictional user. -
A user can be linked to an application with a permission level. - The
risk engine identifies at least three types of risky conditions. - Risk
scores and severity labels follow the documented formula. - A finding
can be assigned and moved through the mitigation workflow. - Simulated
activity events appear in the activity screen. - A risk register can be
filtered and exported. - The app clearly states that the data and events
are simulated.

## 12. Demonstration scenario

Use this short story during the presentation:

1.  Log in as the CampusTrust administrator.
2.  Open the Student Portal asset and show its sensitivity and
    criticality.
3.  Open a fictional user who has retained access after a department
    change.
4.  Run or refresh the risk assessment.
5.  Show the excessive or outdated access finding and its risk score.
6.  Open the finding and assign a mitigation task to the security
    analyst.
7.  Log in as the analyst and move the task to In Progress, then
    Resolved.
8.  Return to the dashboard and show the updated open-risk and
    remediation counts.
9.  Export the risk register.

## 13. Proposed project deliverables

-   Working web application.
-   Source code repository.
-   `spec.md` and `archi.md`.
-   Database schema and seeded fictional demo data.
-   Screenshots of key modules.
-   Short project report and presentation.
-   Test cases and demonstration script.
