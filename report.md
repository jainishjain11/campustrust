# CAMPUS TRUST
## University Digital Identity & Access Risk Management System

**Project Report**

**Submitted in partial fulfilment of the requirements for the degree of Bachelor of Technology in Computer Science and Engineering**

**Submitted by:**  
[Student Name]  
[Registration Number]

**Under the Guidance of:**  
[Faculty Guide Name]

**Department of Computer Science and Engineering**  
SRM Institute of Science and Technology  
Kattankulathur, Tamil Nadu

**Academic Year:** 2026–2027

---

# ABSTRACT

Universities rely on a wide range of digital systems to manage academic, administrative, research and student-related activities. These systems are accessed by different categories of users, including students, faculty members, department coordinators and administrators. As user responsibilities and access requirements change over time, maintaining appropriate permissions across multiple systems becomes increasingly difficult. Unreviewed accounts, excessive privileges and unusual access activities can introduce security risks and make it difficult for administrators to maintain a clear understanding of the institution's security posture.

CampusTrust is a web-based University Digital Identity and Access Risk Management System developed to provide a centralized platform for monitoring user identities, managing digital assets, reviewing access permissions and tracking cybersecurity risks. The system maintains an inventory of university users, departments and digital applications. It also provides an access review mechanism to identify unexpected or excessive permissions and a rule-based risk assessment engine to calculate and classify identified risks.

The risk assessment methodology uses likelihood and impact values on a scale of 1 to 5. The resulting score is used to classify findings into Low, Medium, High and Critical severity levels. The platform also supports simulated security activity monitoring, incident creation, mitigation task assignment and management reporting. A centralized dashboard presents security posture information, risk distribution, departmental exposure and recent security activities.

The application is developed using Next.js, TypeScript, Tailwind CSS, Prisma ORM and SQLite. Its modular architecture integrates the presentation layer, API endpoints, application services and database into a single web application. The interface provides an interactive security management experience with a modern Liquid Glass visual design.

CampusTrust demonstrates how a centralized Management Information System can support identity governance, access reviews, risk prioritization and remediation coordination within a university environment. It is an academic prototype that uses fictional records and simulated security events.

**Keywords:** Cybersecurity Management, Digital Identity Management, Access Control, Risk Assessment, University Information Systems, Security Monitoring, Incident Management, Management Information System.

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background

Educational institutions increasingly depend on digital infrastructure to support their daily operations. University environments typically include student portals, faculty portals, examination systems, library management platforms, research repositories and administrative applications.

Each system contains information that must be accessed only by authorized individuals. Students, faculty members and administrative employees have different responsibilities and therefore require different levels of access.

Managing these permissions becomes challenging when users change departments, responsibilities or employment status. Permissions that were previously appropriate may become unnecessary. In some situations, users may retain access to resources that are no longer relevant to their current responsibilities.

Without a centralized monitoring and review mechanism, identifying these conditions can be difficult. Security-related information may also remain distributed across different systems, making it difficult for administrators to understand overall exposure and prioritize corrective actions.

CampusTrust addresses this problem by providing a centralized platform for managing digital identities, assets, access permissions, security risks and remediation activities.

## 1.2 Problem Statement

Universities manage multiple digital applications that are accessed by users with different responsibilities and authorization requirements. Changes in user roles, department assignments and access requirements can create security concerns such as excessive privileges, outdated permissions, inactive accounts and unusual login activities.

When user information, access permissions, security findings and incident records are maintained separately, administrators may lack a consolidated view of potential security exposure.

There is a need for a centralized Management Information System that can maintain university identity and asset records, identify access-related risks, calculate risk severity, monitor simulated security activities and coordinate mitigation actions.

CampusTrust is designed to address this requirement through an integrated identity and access risk management platform.

## 1.3 Aim of the Project

To design and implement a university-focused digital identity and access risk management system that provides centralized monitoring, risk assessment, access review and incident remediation capabilities.

## 1.4 Objectives

The primary objectives are:

1. To develop a centralized inventory of university users and departments.
2. To maintain a structured inventory of digital assets and applications.
3. To manage user-to-asset access permissions.
4. To identify excessive and unexpected access permissions.
5. To implement a transparent rule-based cybersecurity risk assessment methodology.
6. To classify identified risks according to their severity.
7. To monitor simulated security activities and login events.
8. To provide an incident management and mitigation workflow.
9. To generate management reports and downloadable security records.
10. To provide a centralized dashboard for security-related decision-making.

## 1.5 Scope of the Project

The system focuses on identity and access-related cybersecurity management within a university environment.

### Included in scope

- University user management.
- Department management.
- Digital asset inventory.
- Access permission management.
- Access review and certification.
- Excessive permission detection.
- Risk scoring and severity classification.
- Simulated activity monitoring.
- Incident and mitigation management.
- Security dashboards.
- Management reports and CSV exports.
- Demonstration-oriented role switching.

### Outside the scope

- Direct integration with university production systems.
- Collection of actual student or employee credentials.
- Scanning of university networks.
- Real-time intrusion detection from production network traffic.
- Formal cybersecurity certification or compliance auditing.

The application uses fictional university records and simulated security events. It does not represent an actual security assessment of SRMIST infrastructure.

## 1.6 Intended Users

The system is designed around the following user categories:

**System Administrator:** Manages user records, departments, digital assets, access permissions and overall system information.

**Security Analyst:** Reviews risk findings, examines security activities and manages incident remediation.

**Department Manager:** Reviews department-related information and associated security exposure.

**Student / Viewer:** Represents a read-only demonstration persona for viewing permitted information.

---

# CHAPTER 2: EXISTING SYSTEM AND PROPOSED SYSTEM

## 2.1 Existing System

In a typical university environment, information about users, applications, access permissions and security incidents may be maintained through separate administrative systems.

This separation can create several difficulties:

- Lack of centralized visibility.
- Difficulty identifying outdated permissions.
- Delayed identification of excessive access.
- Limited correlation between users and digital assets.
- Difficulty prioritizing security findings.
- Fragmented incident tracking.
- Limited consolidated reporting.

These challenges can make it difficult for administrators to obtain a complete picture of identity-related security risks.

## 2.2 Proposed System

CampusTrust provides a centralized management platform that combines identity records, digital assets, access permissions, risk findings and remediation activities.

The proposed system provides:

- A centralized user directory.
- A digital asset inventory.
- An access permission matrix.
- Automated rule-based risk evaluation.
- Security activity monitoring.
- Incident and mitigation workflows.
- Management dashboards and reports.

By integrating these functions, CampusTrust helps administrators understand relationships between users, assets, permissions and security findings.

## 2.3 Advantages of the Proposed System

1. Centralized management of identity and access information.
2. Improved visibility into digital asset permissions.
3. Consistent risk scoring methodology.
4. Prioritization of security findings.
5. Structured incident remediation.
6. Better tracking of security activities.
7. Reduced fragmentation of management information.
8. Easier generation of security reports.
9. Improved presentation of institutional risk information.

---

# CHAPTER 3: SYSTEM REQUIREMENTS

## 3.1 Functional Requirements

The system provides the following functional capabilities.

### A. Identity Management

- Display all registered users.
- Search users by name and email.
- Filter users by role and account status.
- Create new user records.
- Edit existing user information.
- Activate or deactivate user accounts.
- Associate users with departments.
- Display user details and related digital assets.
- Display associated risk findings.

### B. Asset Management

- Display registered digital assets.
- Create and edit asset records.
- Assign asset categories.
- Define asset criticality.
- Maintain asset status.
- Display users having access to an asset.
- Display associated risk findings.

### C. Access Reviews

- Display user-to-asset permission relationships.
- Assign access entitlements.
- Identify unexpected permissions.
- Identify excessive access.
- Certify appropriate access.
- Flag permissions requiring investigation.
- Revoke unnecessary access.

### D. Risk Assessment

- Identify predefined risky conditions.
- Calculate likelihood and impact.
- Generate risk scores.
- Classify severity.
- Display findings in a risk register.
- Recalculate risk findings.
- Prevent duplicate findings during repeated evaluations.
- Escalate findings into incidents.

### E. Activity Monitoring

- Display recorded activity events.
- Display timestamps and IP addresses.
- Record failed login events.
- Simulate security-related activities.
- Support different demonstration scenarios.
- Maintain activity history.

### F. Incident Management

- Create incidents from security findings.
- Track incident priority and status.
- Assign mitigation tasks.
- Update task completion status.
- Maintain incident progress.
- Resolve incidents after remediation.

### G. Management Reports

- Display executive security summaries.
- Provide a printable report view.
- Export risk records.
- Export user records.
- Export asset records.
- Export activity logs.

## 3.2 Non-Functional Requirements

**Usability:** The interface should provide clear navigation and understandable information.

**Performance:** Common operations should execute efficiently for the academic demonstration dataset.

**Reliability:** The application should handle invalid input, missing records and unexpected errors.

**Data Integrity:** Database relationships should maintain consistency between users, assets, access records and incidents.

**Maintainability:** Application logic should be organized into reusable components and services.

**Security:** Server-side validation and authorization should be applied to sensitive operations.

**Accessibility:** Text contrast, labels, keyboard interaction and responsive layouts should be considered.

**Privacy:** The academic prototype should use fictional records rather than actual institutional data.

## 3.3 Hardware Requirements

Minimum suggested development environment:

- Modern laptop or desktop computer.
- 8 GB RAM or higher.
- Dual-core processor or better.
- Sufficient storage for the project and dependencies.
- Internet connectivity for initial dependency installation.

## 3.4 Software Requirements

- Operating System: macOS, Windows or Linux.
- Runtime: Node.js.
- Package Manager: npm.
- Development Environment: Visual Studio Code or equivalent.
- Framework: Next.js.
- Programming Language: TypeScript.
- Database: SQLite.
- ORM: Prisma.
- Browser: Modern Chromium-based browser or equivalent.

---

# CHAPTER 4: SYSTEM ARCHITECTURE

## 4.1 Architectural Overview

CampusTrust follows a modular monolithic architecture.

The frontend, API endpoints, business logic and database integration are maintained within a single Next.js application.

The architecture provides separation of responsibilities while avoiding the operational complexity of deploying independent frontend and backend services.

## 4.2 Architectural Layers

### 1. Presentation Layer

The presentation layer is responsible for displaying the application interface and collecting user input.

Its responsibilities include:

- Dashboard visualization.
- User and asset management screens.
- Access review interface.
- Risk register.
- Activity monitoring.
- Incident management.
- Reports and exports.
- Forms, tables, dialogs and navigation.

### 2. API Layer

The API layer handles communication between the frontend and backend services.

It provides endpoints for:

- Retrieving records.
- Creating and updating records.
- Managing permissions.
- Recalculating risks.
- Simulating activities.
- Managing incidents.
- Exporting reports.

The implementation contains 19 API endpoints covering the major application operations.

### 3. Business Logic Layer

The business logic layer handles application-specific operations.

Its responsibilities include:

- Risk calculation.
- Severity classification.
- Access evaluation.
- Risk recalculation.
- Incident processing.
- Mitigation workflow management.
- Report generation.

The risk calculation logic is maintained separately in a dedicated service module.

### 4. Data Layer

The data layer uses Prisma ORM to communicate with the SQLite database.

It manages the storage and retrieval of:

- Departments.
- Users.
- Digital assets.
- Access grants.
- Risk findings.
- Activity records.
- Incidents.
- Mitigation tasks.

## 4.3 Architecture Flow

The general application flow is:

1. A user interacts with the CampusTrust interface.
2. The frontend sends a request to an appropriate API endpoint.
3. The API processes and validates the request.
4. The relevant application service performs the required operation.
5. Prisma communicates with the SQLite database.
6. The API returns a structured response.
7. The frontend updates the displayed information.

## 4.4 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | Next.js 16 | Application interface and server-side capabilities |
| Programming language | TypeScript | Type-safe application development |
| Styling | Tailwind CSS | Responsive interface styling |
| Database | SQLite | Persistent application storage |
| ORM | Prisma | Database access and schema management |
| Charts | Recharts | Dashboard visualizations |
| Icons | Lucide React | Interface iconography |
| API | Next.js API routes | Backend operations |
| Build system | Turbopack | Application compilation and build |

## 4.5 Database Design

The application uses a relational database structure to represent relationships between users, departments, digital assets and security records.

The main database entities include:

### Department

Stores university department information.

Important fields:

- id
- name
- code
- description
- createdAt
- updatedAt

### User

Stores identity information.

Important fields:

- id
- fullName
- email
- passwordHash
- role
- status
- departmentId
- createdAt
- updatedAt

A user can be associated with a department and can have multiple access grants, activities and risk findings.

### Asset

Stores information about university digital systems.

Important fields:

- id
- name
- code
- category
- description
- criticality
- status
- createdAt
- updatedAt

### AccessGrant

Represents the relationship between a user and a digital asset.

Important fields:

- id
- userId
- assetId
- accessLevel
- isExpected
- grantedAt
- expiresAt

The unique user-and-asset relationship helps prevent duplicate access grant records.

### RiskFinding

Stores identified cybersecurity risks.

Important fields:

- id
- findingCode
- title
- description
- category
- likelihood
- impact
- score
- severity
- status
- userId
- assetId
- createdAt
- updatedAt

### ActivityLog

Stores security-related activity information.

Important fields:

- id
- action
- description
- eventType
- ipAddress
- userId
- assetId
- createdAt

### Incident

Stores security incidents and their associated information.

Important fields:

- id
- incidentCode
- title
- description
- status
- priority
- riskFindingId
- assetId
- reportedById
- createdAt
- updatedAt

### MitigationTask

Stores corrective tasks associated with incidents.

Important fields:

- id
- title
- description
- status
- dueDate
- incidentId
- assigneeId
- creatorId
- createdAt
- updatedAt

## 4.6 Database Relationships

The main relationships are:

- One department can contain multiple users.
- One user can have multiple access grants.
- One asset can be associated with multiple access grants.
- One user can have multiple risk findings.
- One asset can have multiple risk findings.
- One user can generate multiple activity records.
- One asset can be associated with multiple activity records.
- One risk finding can be associated with multiple incidents.
- One incident can contain multiple mitigation tasks.
- Users can be associated with mitigation tasks as assignees or creators.

These relationships allow the application to display connected information through user and asset detail views.

---

# CHAPTER 5: MODULE IMPLEMENTATION

## 5.1 Security Dashboard

The Security Dashboard acts as the central monitoring interface of CampusTrust.

It provides a consolidated overview of identity-related security information.

### Features

- Total registered users.
- Total registered digital assets.
- Open risk findings.
- Resolved risk findings.
- Security posture score.
- Risk severity distribution.
- Department risk exposure.
- Recent security findings.
- Recent activity feed.

### Security Posture Score

The dashboard includes a security posture indicator represented on a scale of 0 to 100.

It provides a summarized view of the system's calculated security condition.

The score is presented as an application-level indicator and should not be interpreted as a formal cybersecurity certification.

### Risk Distribution

The dashboard visualizes findings according to their severity categories.

The chart allows administrators to understand the distribution of security findings without manually examining every record.

### Department Risk Exposure

Department-level risk cards provide a consolidated view of risk information associated with university departments.

### Implementation

Dashboard information is retrieved from the backend through the dashboard API and displayed using dynamic frontend components and Recharts visualizations.

## 5.2 Identity Management Module

The Identity Management module maintains the university user directory.

### Features

- View all registered users.
- Search by name and email.
- Filter by role.
- Filter by account status.
- Add new users.
- Edit user information.
- Activate or deactivate accounts.
- Assign departments.
- Open detailed user dossiers.
- View associated assets and risk findings.

### User Details Dossier

The dossier provides additional information about an individual user, including identity information, linked assets and associated security findings.

This allows administrators to examine a user's relationships within the system.

### Implementation

The module communicates with user-related API endpoints and stores information through Prisma in the SQLite database.

## 5.3 Asset Inventory Module

The Asset Inventory module maintains a catalog of university digital applications and resources.

### Example digital assets

- Student Portal.
- Faculty Portal.
- Library Management System.
- Research Repository.
- Hostel Management Portal.
- Examination Management System.

### Features

- View registered assets.
- Register new assets.
- Edit asset information.
- Assign asset categories.
- Define criticality ratings.
- Maintain asset status.
- View users with access to an asset.
- View associated risk findings.

### Asset Criticality

Each digital asset receives a criticality rating between 1 and 5.

Higher criticality indicates that the asset requires greater attention during risk assessment and access review.

### Asset Security Dossier

The dossier displays relevant information about the selected asset, including entitled users and associated risk findings.

## 5.4 Access Reviews Module

The Access Reviews module evaluates user-to-asset permission relationships.

It helps identify whether assigned access is appropriate for a user's role and responsibilities.

### Features

- User-to-asset permission matrix.
- Access level visibility.
- Expected versus unexpected access comparison.
- Out-of-role access detection.
- Excessive permission identification.
- Access certification.
- Access flagging.
- Access revocation.
- Entitlement assignment.

### Access Review Actions

**Certify:** Marks an access relationship as reviewed and accepted.

**Flag:** Marks a permission for further investigation.

**Revoke:** Removes an unnecessary access grant.

**Assign Entitlement:** Creates a new user-to-asset permission relationship.

### Importance

The module helps identify permissions that may no longer be required and supports a structured access review process.

## 5.5 Risk Assessment Engine

The Risk Assessment Engine is one of the central components of CampusTrust.

It evaluates predefined identity and access-related conditions and assigns risk scores to identified findings.

The calculation logic is maintained in a dedicated service module named `risk-engine.service.ts`.

### Risk Identification

The system supports risk conditions such as:

- Excessive access permissions.
- Unexpected or out-of-role access.
- Overdue access reviews.
- Unusual access patterns.
- Other predefined identity-related security conditions.

### Risk Scoring Methodology

The system uses two primary parameters:

**Likelihood:** Represents the estimated possibility of the identified condition resulting in a security problem.

**Impact:** Represents the potential consequence if the condition is exploited or remains unresolved.

Both parameters use a scale from 1 to 5.

The risk score is calculated as:

Risk Score = Likelihood × Impact

### Risk Severity Classification

| Score | Severity |
|---|---|
| 1–4 | Low |
| 5–9 | Medium |
| 10–16 | High |
| 17–25 | Critical |

### Example

Consider a fictional faculty member who has administrative access to a research repository even though that permission is not expected for the user's current responsibilities.

Assigned values:

- Likelihood = 4
- Impact = 5

Risk score:

4 × 5 = 20

The resulting classification is Critical.

### Risk Recalculation

The system includes an interactive recalculation function.

The recalculation mechanism evaluates existing conditions and updates corresponding risk records instead of unnecessarily creating duplicate findings.

### Escalation

Identified risk findings can be escalated into incidents for further investigation and remediation.

**Methodology limitation:** The scoring mechanism is a transparent educational risk assessment model. It is rule-based and does not represent a predictive model or formal enterprise risk assessment standard.

## 5.6 Activity Monitoring Module

The Activity Monitoring module provides visibility into security-related activities recorded within the application.

### Features

- Activity stream.
- Event descriptions.
- Event categories.
- IP address display.
- Timestamps.
- User and asset associations.
- Simulated security event generation.

### Simulated Security Events

The application supports demonstration scenarios such as:

1. Failed Login Bursts.
2. Privilege Escalations.
3. Off-Hours Access.
4. Single Sign-On related activity.

These events demonstrate how security-related activity can be recorded and reviewed.

### Purpose

The module provides a centralized history of security-related events and supports the investigation of unusual activity patterns.

All generated demonstration events are simulated.

## 5.7 Incident Management Module

The Incident Management module converts identified security findings into manageable remediation activities.

### Features

- Create incidents.
- Associate incidents with risk findings.
- Assign incident priority.
- Maintain incident status.
- Assign mitigation tasks.
- Track task completion.
- Resolve incidents.
- Update associated risk findings.

### Incident Lifecycle

The implemented incident workflow follows three primary states:

1. Open.
2. In Progress.
3. Resolved.

### Mitigation Tasks

Each incident can contain mitigation tasks assigned to responsible users.

The task checklist allows users to update completion status.

### Automatic Risk Resolution

When an associated incident is closed, the application updates the corresponding risk finding to reflect its resolved status.

This maintains a connection between risk identification and remediation.

## 5.8 Management Reports Module

The Management Reports module provides summarized information for administrative review.

### Features

- Executive summary.
- Security report view.
- Printable report.
- CSV export center.
- Risk register export.
- User directory export.
- Asset inventory export.
- Activity telemetry export.

### CSV Export

The application supports downloadable CSV records for the main management entities.

These reports can be used for offline analysis, academic demonstration and record keeping.

---

# CHAPTER 6: USER INTERFACE AND EXPERIENCE DESIGN

## 6.1 Design Philosophy

CampusTrust uses a modern cybersecurity-oriented interface designed to provide a professional and visually consistent user experience.

The interface combines dark visual surfaces, translucent panels, luminous accents and structured information layouts.

## 6.2 Liquid Glass Design System

The application uses a Liquid Glass-inspired visual language.

The primary design elements include:

- Deep midnight navy backgrounds.
- Translucent glass surfaces.
- Frosted background blur.
- Subtle glass borders.
- Electric blue and cyan highlights.
- Soft shadows and luminous edges.
- Consistent typography and spacing.

## 6.3 Colour Palette

| Design element | Colour |
|---|---|
| Main background | #030712 |
| Secondary background | #060b1e |
| Deep navy | #0a1128 |
| Electric cyan | #22d3ee |
| Neon blue | #3b82f6 |
| Deep violet | #8b5cf6 |
| Critical severity | #ef4444 |
| Warning severity | #f59e0b |
| Normal status | #10b981 |

## 6.4 Navigation

The application includes a floating translucent navigation interface with active navigation indicators.

The interface provides access to all major system modules.

A top navigation area also includes the demonstration persona switcher and relevant application controls.

## 6.5 Motion and Interaction

The interface uses subtle animations to improve interaction and visual presentation.

Examples include:

- Smooth page transitions.
- Card entrance animations.
- Animated counters.
- Chart transitions.
- Hover effects.
- Modal transitions.
- Background network animations.
- Glowing security indicators.

The purpose of these visual elements is to improve the presentation and readability of the system without affecting its core functionality.

---

# CHAPTER 7: ROLE-BASED DEMONSTRATION AND ACCESS CONTROL

## 7.1 Role-Based Concept

CampusTrust represents different university user categories through a demonstration persona system.

The implemented personas include:

- Admin.
- Security Analyst.
- Department Manager.
- Student / Viewer.

Each persona represents a different level of responsibility within the university security management environment.

## 7.2 Demo Persona Switcher

The application includes an interactive Demo Persona Switcher in the header and sidebar.

It allows the presenter to switch between different demonstration personas during a live demonstration.

This makes it possible to illustrate how the interface and management workflows differ according to user responsibilities.

## 7.3 Important Implementation Distinction

The persona switcher is a demonstration capability. It should not be represented as proof of production-grade authentication or server-enforced RBAC.

Actual server-side authentication and authorization must be separately verified before the application is deployed for real institutional use.

---

# CHAPTER 8: SYSTEM WORKFLOW

## 8.1 General Workflow

The overall CampusTrust workflow consists of the following stages:

1. Maintain user and department information.
2. Register digital assets.
3. Associate users with digital assets.
4. Review assigned access permissions.
5. Identify unexpected or excessive permissions.
6. Evaluate identified conditions using the risk assessment engine.
7. Generate risk findings.
8. Escalate selected findings into incidents.
9. Assign mitigation tasks.
10. Track remediation progress.
11. Resolve incidents and update associated risk findings.
12. Display updated management information through the dashboard.
13. Generate and export reports.

## 8.2 Demonstration Scenario

The following scenario demonstrates the complete risk management workflow.

A fictional faculty member named Aarav Sharma has administrative access to a university research repository.

However, the assigned administrative permission is not expected for the user's current responsibilities.

### Step 1: User and Asset Identification

The administrator opens the Identity Management module and identifies the relevant user.

The administrator then opens the Research Repository in the Asset Inventory module.

### Step 2: Access Review

The administrator examines the permission matrix and identifies an unexpected administrative permission.

### Step 3: Risk Identification

The risk assessment engine identifies the excessive access condition.

### Step 4: Risk Calculation

The condition receives:

- Likelihood: 4
- Impact: 5
- Risk Score: 20
- Severity: Critical

### Step 5: Incident Creation

The identified finding is escalated into an incident.

### Step 6: Mitigation Assignment

A mitigation task is assigned to the responsible security analyst.

### Step 7: Incident Resolution

The analyst updates the task and moves the incident through its lifecycle until it reaches Resolved.

### Step 8: Dashboard Update

The administrator returns to the dashboard to review the updated risk information.

### Step 9: Report Generation

The administrator exports the risk register for further review.

This scenario demonstrates the connection between identity management, access review, risk assessment, incident management and reporting.

---

# CHAPTER 9: TESTING AND VALIDATION

## 9.1 Testing Objectives

Testing was performed to evaluate whether the application components operate correctly and whether the major management workflows can be completed.

The testing activities included:

- TypeScript validation.
- Production build verification.
- API endpoint testing.
- Database operation testing.
- Risk calculation verification.
- Incident workflow verification.
- CSV export verification.

## 9.2 TypeScript Validation

The following command was executed:

`npx tsc --noEmit`

**Result:** Zero TypeScript errors.

This verifies that the project passes the TypeScript compiler checks.

## 9.3 Production Build Verification

The following command was executed:

`npm run build`

**Result:** Successful production build with exit code 0.

The build completed successfully using the Next.js Turbopack build system.

A total of 20 application routes were reported as compiled.

## 9.4 API Testing Results

The following API operations were tested during project verification.

| Test case | Expected result | Recorded result |
|---|---|---|
| Dashboard API | Return dashboard statistics | HTTP 200 |
| Users API | Return user records | HTTP 200 |
| Assets API | Return asset records | HTTP 200 |
| Access API | Return access grants | HTTP 200 |
| Risks API | Return risk findings | HTTP 200 |
| Activity API | Return activity records | HTTP 200 |
| Incident creation | Create an incident | HTTP 201 |
| Departments API | Return departments | HTTP 200 |
| Activity simulation | Insert simulated activity | HTTP 200 |
| Risk recalculation | Execute risk evaluation | HTTP 200 |
| Risk CSV export | Generate CSV file | HTTP 200 |
| User CSV export | Generate CSV file | HTTP 200 |
| Asset CSV export | Generate CSV file | HTTP 200 |

## 9.5 Recorded Test Dataset

During the reported verification run, the application returned the following sample database information:

| Entity | Recorded count |
|---|---:|
| Users | 8 |
| Digital assets | 6 |
| Open risk findings | 6 |
| Activity records | 5 |
| Departments | 4 |
| Access grants | 4 |

These values represent a particular verification snapshot and may change as records are added, updated or resolved.

## 9.6 Risk Assessment Testing

The risk assessment engine was verified through the recalculation API.

The verification confirmed that the rule engine executed successfully and updated the risk register.

The implementation also includes duplicate prevention during repeated risk evaluation.

## 9.7 Incident Testing

Incident creation was tested successfully.

The application generated an incident record with a unique database identifier.

The incident management module supports status updates and associated mitigation task tracking.

## 9.8 Export Testing

CSV export operations were tested for:

- Risk records.
- User records.
- Asset records.

The tested endpoints returned successful responses containing CSV data.

## 9.9 Testing Summary

The reported verification results indicate that:

- TypeScript validation passed.
- Production compilation completed successfully.
- Selected API endpoints returned successful HTTP responses.
- Incident creation worked.
- Activity simulation worked.
- Risk recalculation worked.
- Selected CSV exports worked.

Browser-level testing of every interaction should be documented separately using the final UI/UX quality assurance report.

---

# CHAPTER 10: RESULTS AND DISCUSSION

## 10.1 Results

The developed CampusTrust application provides a centralized platform for managing university digital identities and access-related security risks.

The completed implementation includes the following major components:

1. Security Dashboard.
2. Identity Management.
3. Asset Inventory.
4. Access Reviews.
5. Risk Assessment Engine.
6. Activity Monitoring.
7. Incident Management.
8. Management Reports.
9. Demo Persona Switcher.
10. Liquid Glass user interface.

The backend includes 19 API endpoints covering the major application operations.

The database maintains relationships between users, departments, assets, access grants, risk findings, activities, incidents and mitigation tasks.

## 10.2 Discussion

The project demonstrates how information from different university management functions can be combined into one centralized system.

The integration of identity records and digital assets allows access relationships to be reviewed in a structured manner.

The rule-based risk engine provides a transparent approach for assigning severity levels to identified conditions. The incident workflow then connects those findings to corrective activities.

The dashboard provides summarized information to support administrative review and decision-making.

The system therefore demonstrates the value of integrating operational records, risk evaluation and remediation tracking within a Management Information System.

## 10.3 Project Achievements

- Developed a complete university-focused identity and access management prototype.
- Implemented a structured digital asset inventory.
- Created an access review mechanism.
- Implemented a rule-based risk scoring engine.
- Developed simulated security activity monitoring.
- Implemented incident and mitigation workflows.
- Integrated management dashboards and report exports.
- Established a relational SQLite database.
- Achieved successful TypeScript validation and production compilation in the reported verification run.

---

# CHAPTER 11: LIMITATIONS

Although CampusTrust provides the major features required for its academic demonstration, certain limitations remain.

1. **Academic prototype:** The system is designed for demonstration and does not replace an enterprise identity governance platform.

2. **Fictional data:** User records, assets and security events are demonstration data rather than actual university information.

3. **Simulated telemetry:** Activity events are generated within the application and are not collected from real university network infrastructure.

4. **Rule-based risk assessment:** Risk classification depends on predefined rules and likelihood-impact values. It does not provide predictive threat intelligence.

5. **Simplified access model:** The access model represents selected university permissions and may not cover every possible enterprise authorization scenario.

6. **Demonstration personas:** The persona switcher illustrates different user responsibilities and should not be treated as production authentication or authorization without separately verified server-side enforcement.

7. **Local database deployment:** SQLite is suitable for the academic prototype. A larger production environment may require a database architecture designed for concurrent institutional usage.

These limitations define the boundaries of the current implementation and provide opportunities for further development.

---

# CHAPTER 12: FUTURE ENHANCEMENTS

The following improvements may be considered in future versions.

## 12.1 Enterprise Authentication

Integration with an institutional identity provider and secure single sign-on could provide centralized authentication.

## 12.2 Advanced Role-Based Access Control

A more comprehensive authorization model could define permissions at the individual module, operation and resource levels.

## 12.3 Real-Time Security Integrations

Future versions could integrate with authorized log management systems, security information and event management platforms, and identity providers.

## 12.4 Advanced Risk Analysis

The risk assessment model could be extended with configurable policies, historical trend analysis and more detailed impact calculations.

## 12.5 Audit Trail

A dedicated audit logging mechanism could maintain a detailed record of administrative actions and changes to sensitive records.

## 12.6 Notifications

Email or in-application notifications could inform responsible administrators about critical findings and overdue mitigation tasks.

## 12.7 Advanced Reporting

Future reporting capabilities could include scheduled reports, department comparisons, risk trend analysis and additional export formats.

## 12.8 Scalable Database Infrastructure

A production-oriented version could migrate to PostgreSQL or another suitable relational database.

## 12.9 Security Network Visualization

The existing security network visualization could be expanded to represent larger institutional environments and more complex relationships between users, assets and findings.

---

# CHAPTER 13: CONCLUSION

CampusTrust was developed as a university-focused Digital Identity and Access Risk Management System to address the challenges associated with managing user identities, digital assets and access permissions within an educational institution.

The application integrates identity management, asset inventory, access reviews, risk assessment, activity monitoring, incident management and reporting into a centralized web-based platform.

Its rule-based risk assessment engine provides a structured method for identifying and prioritizing access-related security conditions through likelihood and impact calculations. The incident management workflow connects identified findings with mitigation activities and provides a mechanism for tracking their resolution.

The dashboard presents consolidated security information, while the reporting module supports the generation and export of management records.

The implementation demonstrates the practical application of database management, web application architecture, access governance and risk management principles within a university environment.

Overall, CampusTrust provides a functional academic prototype that demonstrates how a centralized Management Information System can improve visibility, organization and coordination in university identity and access risk management.

---

# REFERENCES

The following references may be used as a starting point. Verify the exact edition, publication details and access dates before final submission.

1. National Institute of Standards and Technology (NIST), *Security and Privacy Controls for Information Systems and Organizations*, Special Publication 800-53, Revision 5, 2020.

2. National Institute of Standards and Technology (NIST), *Guide for Conducting Risk Assessments*, Special Publication 800-30, Revision 1, 2012.

3. National Institute of Standards and Technology (NIST), *Digital Identity Guidelines*, Special Publication 800-63 series.

4. International Organization for Standardization, *ISO/IEC 27001:2022 — Information Security Management Systems — Requirements*, 2022.

5. OWASP Foundation, *OWASP Application Security Verification Standard (ASVS)*.

6. Next.js Documentation, https://nextjs.org/docs

7. Prisma Documentation, https://www.prisma.io/docs

8. SQLite Documentation, https://www.sqlite.org/docs.html

9. TypeScript Documentation, https://www.typescriptlang.org/docs/

10. Recharts Documentation, https://recharts.org/

---

# APPENDIX A: IMPORTANT PROJECT COMPONENTS

| Component | Implementation |
|---|---|
| Main application | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite |
| Database ORM | Prisma |
| Risk engine | `risk-engine.service.ts` |
| Dashboard API | `/api/dashboard` |
| User API | `/api/users` |
| Asset API | `/api/assets` |
| Access API | `/api/access` |
| Risk API | `/api/risks` |
| Activity API | `/api/activity` |
| Incident API | `/api/incidents` |
| Report APIs | `/api/reports` |
| Project documentation | `spec.md`, `archi.md`, `PROJECT_PROGRESS.md` |

# APPENDIX B: SUGGESTED FIGURES AND SCREENSHOTS

Include screenshots from the actual running application for the following:

1. CampusTrust introductory screen.
2. Security Dashboard.
3. Security posture score and risk distribution.
4. Department risk exposure.
5. Identity Management user directory.
6. User Details Dossier.
7. Asset Inventory.
8. Asset Security Dossier.
9. Access Reviews permission matrix.
10. Risk Register.
11. Risk calculation details.
12. Activity Monitoring screen.
13. Simulated security event interface.
14. Incident Management screen.
15. Mitigation task checklist.
16. Management Reports.
17. CSV Export Center.
18. Demo Persona Switcher.
19. Interactive Security Network Visualization.

# APPENDIX C: SUGGESTED DIAGRAMS

Prepare the following diagrams for the final report:

1. System Architecture Diagram — showing the presentation, API, business logic and database layers.
2. Entity Relationship Diagram — showing all major database entities and their relationships.
3. Use Case Diagram — showing the administrator, security analyst, department manager and viewer interactions.
4. Data Flow Diagram — showing how identity and access information is processed into risk findings and reports.
5. Activity Diagram — showing the access review and risk remediation workflow.
6. Incident Lifecycle Diagram — showing Open, In Progress and Resolved states.

---

**END OF REPORT**