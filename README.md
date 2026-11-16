# CampusTrust
### University Digital Identity & Access Risk Management System

CampusTrust is a university-focused security management prototype designed to manage digital identities, monitor access permissions, assess security risks and coordinate incident remediation through a centralised dashboard.

## 1. Project Overview

Universities manage multiple users, departments and digital resources. Changes in roles, excessive permissions, inactive accounts and suspicious access activities can introduce security risks.

CampusTrust provides a centralised platform to manage these areas, identify access mismatches, calculate risk scores and track mitigation activities.

**Project Type:** Academic Cybersecurity / Management Information System Prototype

## 2. Key Features

- **Security Dashboard:** Security posture statistics, risk distribution and department-wise exposure.
- **Identity Management:** User registration, editing, account status management and user profiles.
- **Asset Inventory:** Digital asset registration, criticality classification and asset details.
- **Access Reviews:** User-to-asset permission monitoring, access certification and revocation.
- **Risk Assessment:** Rule-based risk scoring using likelihood × impact.
- **Activity Monitoring:** Security event logs and simulated activity generation.
- **Incident Management:** Incident tracking, assignment and mitigation task management.
- **Management Reports:** Executive summaries and CSV exports.
- **Demo Persona Switcher:** Demonstration views for different university roles.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | SQLite |
| ORM | Prisma |
| Charts | Recharts |
| Icons | Lucide React |
| Build System | Turbopack |

## 4. Risk Assessment Methodology

CampusTrust uses a transparent rule-based risk calculation.

**Risk Score = Likelihood × Impact**

Both values are rated from 1 to 5.

| Score | Severity |
|---|---|
| 1–4 | Low |
| 5–9 | Medium |
| 10–16 | High |
| 17–25 | Critical |

The calculated score helps prioritise findings for review and remediation. It is an educational assessment model, not a formal security certification.

## 5. Project Structure

```text
campustrust/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── page.tsx
│   │   └── ...
│   ├── components/
│   └── lib/
├── screenshots/
├── .env
├── package.json
└── README.md
```

## 6. Installation and Setup

### Prerequisites
- Node.js 22 or compatible version
- npm
- Git

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd mis_cyber
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

### Step 4: Set up the database

```bash
npx prisma migrate dev
```

### Step 5: Seed demo data

```bash
npx prisma db seed
```

### Step 6: Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

## 7. Database Entities

The Prisma database includes:

- Department
- User
- Asset
- AccessGrant
- RiskFinding
- ActivityLog
- Incident
- MitigationTask

These entities maintain relationships between university users, departments, digital assets, access permissions, security findings and remediation activities.

## 8. Main Application Modules

| Module | Purpose |
|---|---|
| Dashboard | Overall security posture |
| Identity Management | University user administration |
| Asset Inventory | Digital resource management |
| Access Reviews | Permission verification |
| Risk Assessment | Risk identification and prioritisation |
| Activity Monitoring | Security event monitoring |
| Incident Management | Incident and mitigation tracking |
| Management Reports | Reporting and data exports |

## 9. Testing and Validation

The project has undergone the following reported verification checks:

- TypeScript compilation using `npx tsc --noEmit`.
- Production build using `npm run build`.
- API endpoint response checks.
- User and asset CRUD verification.
- Risk recalculation and duplicate prevention checks.
- Activity simulation and CSV export checks.

## 10. Screenshots

Application screenshots are maintained in the `screenshots/` directory.

Add screenshots of the following modules:

1. Security Dashboard
2. Risk Distribution and Department Exposure
3. User Directory
4. Add User and User Details
5. Asset Inventory and Asset Details
6. Access Review Matrix
7. Risk Register and Risk Heatmap
8. Activity Monitoring
9. Incident Management
10. Management Reports
11. Demo Persona Switcher

## 11. Prototype Limitations

- Uses fictional demonstration data.
- Activity monitoring is simulated rather than connected to live university infrastructure.
- The persona switcher is intended for demonstrations and should not be treated as production-grade server-side authentication and authorisation.
- Risk scoring uses predefined rules rather than predictive machine learning.
- The application is an academic prototype and has not been deployed as a production university security system.

## 12. Future Enhancements

- Implement secure server-side authentication and role-based authorisation.
- Integrate university Single Sign-On.
- Introduce automated access-review scheduling.
- Integrate real security event sources.
- Add notification and alert mechanisms.
- Expand reporting and audit capabilities.

## 13. References

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Recharts Documentation](https://recharts.org/en-US/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**CampusTrust – Trust Every Identity. Secure Every Connection.**