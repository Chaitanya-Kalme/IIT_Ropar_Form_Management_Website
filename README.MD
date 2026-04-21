# IIT Ropar — Form Management Website

A full-stack, multi-portal web application built for IIT Ropar that digitises the institution's paper-based form and approval workflow. Students submit forms online, verifiers (HOD, Dean, Caretaker, etc.) review and approve or reject them through a configurable multi-level verification chain, and administrators control every aspect of the system through a dedicated portal.

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Portals](#portals)
  - [Backend (API Server)](#backend-api-server)
  - [Admin Portal](#admin-portal)
  - [Verifier Portal](#verifier-portal)
  - [User Portal](#user-portal)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Roles & Permissions](#roles--permissions)
- [Key Workflows](#key-workflows)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Folder-Level READMEs](#folder-level-readmes)

---

## Project Overview

IIT Ropar's administrative processes involve numerous forms — leave applications, No Objection Certificates, mess clearance, facility bookings, and more — that traditionally moved through physical signatures across multiple offices. This system replaces that process with:

- **Dynamic Form Builder** — Admins create forms with any combination of field types and assign an ordered chain of verifiers.
- **Multi-Level Approval Pipeline** — Each form submission travels through configured verification levels (1 → 2 → … → N) before reaching a final approved or rejected state.
- **Role-Aware Portals** — Separate Next.js apps tailored to each user type (Student, Verifier, Admin) so every actor only sees what is relevant to them.
- **Immutable Audit Log** — Every action (form creation, submission, approval, rejection, member updates) is recorded with actor identity, timestamp, and a before/after diff.
- **Google OAuth** — Single sign-on via institutional Google accounts; no separate password management required.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Hosting)                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  User Portal │  │Admin Portal  │  │ Verifier Portal  │  │
│  │  (Next.js)   │  │  (Next.js)   │  │    (Next.js)     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘           │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │    Backend      │                        │
│                  │  (Next.js API)  │                        │
│                  │  NextAuth (JWT) │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   PostgreSQL    │                        │
│                  │  (via Prisma)   │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

All three portals are separate Next.js applications that communicate exclusively through the backend's REST API. The backend handles authentication (NextAuth v4 with Google OAuth), database operations (Prisma ORM + PostgreSQL), file uploads, and audit logging.

---

## Repository Structure

```
IIT_Ropar_Form_Management_Website-main/
├── README.md                   ← This file (complete project overview)
├── vercel.json                 ← Vercel monorepo routing configuration
│
├── backend/                    ← API server (Next.js API Routes + Prisma)
│   ├── README.md
│   ├── prisma/
│   │   ├── schema.prisma       ← Database models & enums
│   │   └── migrations/         ← SQL migration history
│   └── src/
│       ├── app/api/            ← REST API route handlers
│       │   ├── auth/           ← NextAuth configuration
│       │   ├── admin/          ← Admin-only endpoints
│       │   ├── form/           ← Form CRUD endpoints
│       │   ├── submissions/    ← Submission lifecycle endpoints
│       │   ├── verifier/       ← Verifier-facing endpoints
│       │   ├── users/          ← User management endpoints
│       │   ├── logs/           ← Audit log endpoints
│       │   └── insertDummyData/← Seeding endpoint (dev only)
│       └── lib/
│           ├── prisma.ts       ← Singleton Prisma client
│           ├── logHelper.ts    ← Audit log query helpers
│           └── users.query.ts  ← Reusable user queries
│
├── admin_portal/               ← Admin dashboard (Next.js + shadcn/ui + MUI)
│   ├── README.md
│   └── src/
│       ├── app/                ← Next.js App Router pages
│       │   ├── (protected)/    ← Auth-gated routes
│       │   │   ├── dashboard/
│       │   │   ├── forms/      ← Form builder, submissions, pending approvals
│       │   │   ├── members/    ← Verifier management
│       │   │   ├── users/      ← Student/user management
│       │   │   ├── activity/   ← Audit log viewer
│       │   │   └── settings/
│       │   └── login/
│       └── components/         ← Feature components + shadcn/ui primitives
│
├── user_portal/                ← Student-facing portal (Next.js + shadcn/ui)
│   ├── README.md
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/    ← Auth-gated routes
│       │   │   ├── dashboard/
│       │   │   ├── forms/      ← Available forms & submission UI
│       │   │   ├── history/    ← Submission history
│       │   │   ├── profile/
│       │   │   └── submission/ ← Submission detail & status tracker
│       │   └── login/
│       ├── components/
│       └── lib/
│
└── verifier portal/            ← Verifier-facing portal (Next.js + Tailwind)
    ├── README.md
    └── app/
        ├── dashboard/
        ├── assigned-forms/     ← Forms this verifier is assigned to
        ├── pending-approvals/  ← Submissions awaiting this verifier's action
        ├── all-submissions/    ← Full submission list (read-only)
        ├── form-details/       ← Per-submission detail & approve/reject
        ├── activity/           ← Verifier's own action history
        └── profile/
```

---

## Portals

### Backend (API Server)

**Location:** `backend/`

A Next.js application used purely as an API server — it has no user-facing pages. Every other portal talks to this server over HTTP. It owns:

- **Authentication** via NextAuth v4 (Google OAuth). On first sign-in, users are auto-created in the database.
- **Database access** via Prisma ORM connected to PostgreSQL.
- **File uploads** stored in `public/uploads/<userId>/` and served through a catch-all route.
- **Audit logging** — every mutating operation writes a structured `AuditLog` record.

Key API groups:

| Prefix | Description |
|--------|-------------|
| `/api/auth/` | NextAuth sign-in / session |
| `/api/admin/` | Register, update, delete verifiers; dashboard stats |
| `/api/form/` | Create, read, update forms; public form list |
| `/api/submissions/` | Submit forms; get submission detail; verifier actions |
| `/api/verifier/` | Verifier dashboard, assigned forms, pending approvals |
| `/api/users/` | Admin view of all registered users |
| `/api/logs/` | Paginated, filterable audit log |

### Admin Portal

**Location:** `admin_portal/`

A full-featured admin dashboard where users with the `Admin` role manage the entire system:

- **Dashboard** — KPI cards (total forms, submissions, members, users), recent activity feed.
- **Form Builder** — Drag-and-drop field ordering, support for text, number, date, email, tel, file, checkbox, radio, select, and textarea fields. Each form has an optional deadline and an ordered verifier chain.
- **Form Management** — Toggle form status (open/closed), edit fields and verifier chains, view all submissions per form.
- **Pending Approvals** — Admin view across all pending submissions system-wide.
- **Member Management** — Create/edit/delete verifier accounts; assign roles (HOD, Dean, Caretaker, Faculty, Mess Manager, Assistant Registrar).
- **User Management** — View all registered student accounts.
- **Activity Log** — Filterable, paginated audit trail of every system event.
- **Settings** — Admin profile and system configuration.

### Verifier Portal

**Location:** `verifier portal/`

A purpose-built interface for staff members who review and act on form submissions:

- **Dashboard** — Summary of assigned forms, pending reviews, and completed verifications.
- **Assigned Forms** — All forms where this verifier appears in the verification chain.
- **Pending Approvals** — Submissions currently sitting at this verifier's level, with full form data displayed and approve/reject/remark actions.
- **All Submissions** — Read-only view of all submissions across all forms (no action buttons if already processed).
- **Form Details** — Full submission detail including uploaded file previews and the complete verification chain timeline.
- **Activity** — This verifier's own action history.
- **Profile** — View and update personal profile.

### User Portal

**Location:** `user_portal/`

The student-facing interface:

- **Dashboard** — Overview of active forms and recent submission statuses.
- **Forms** — Browse all currently open forms. Submit a form with real-time field validation.
- **Submission Detail** — Track a specific submission's progress through the verification chain with a visual status tracker showing which level approved/rejected and any remarks.
- **History** — Full list of all past submissions with their current status.
- **Profile** — View account details.

---

## Database Schema

The database is PostgreSQL managed by Prisma. Core models:

| Model | Description |
|-------|-------------|
| `User` | Student/applicant accounts (auto-created on Google sign-in) |
| `Verifier` | Staff accounts with a `Role` (Admin, HOD, Dean, Faculty, etc.) |
| `Form` | Form definition including JSON field schema, deadline, and status flag |
| `FormVerifierLevel` | Junction table — ordered verification chain per form (formId + level + verifierId) |
| `FormSubmissions` | A user's submitted form data (JSON), current approval level, and overall status |
| `VerificationAction` | One record per verifier action (approve/reject) per submission level |
| `AuditLog` | Immutable event log for every system mutation |

**Enums:**

- `Role` — `Admin | HOD | Caretaker | Dean | Faculty | Assistant_Registrar | Mess_Manager`
- `SubmissionStatus` — `Pending | Approved | Rejected`
- `LogAction` — 20+ specific action types covering user, verifier, form, submission, and verification events
- `ActorType` — `User | Verifier | System`

---

## Authentication

Authentication is handled centrally by the **backend** using NextAuth v4 with a Google OAuth provider and JWT session strategy.

**Sign-in flow:**

1. User clicks "Sign in with Google" on any portal's login page.
2. NextAuth validates the Google token.
3. The backend's `signIn` callback checks whether the email belongs to a `Verifier` record. If yes, the verifier is allowed in. If no, a `User` record is upserted automatically.
4. The `jwt` callback enriches the token with `id`, `role`, and `portal` (`"admin"`, `"verifier"`, or `"user"`).
5. The `session` callback exposes these fields to the client.

All three portals share the same NextAuth configuration and backend session endpoint, so a single Google account is consistently identified as admin, verifier, or student across all portals.

---

## Roles & Permissions

| Role | Portal Access | Capabilities |
|------|--------------|--------------|
| `Admin` | Admin Portal | Full system access — form builder, verifier management, user management, audit logs |
| `HOD`, `Dean`, `Caretaker`, `Faculty`, `Assistant_Registrar`, `Mess_Manager` | Verifier Portal | View assigned forms, approve/reject/remark submissions at their level |
| Regular user (no role) | User Portal | Browse open forms, submit, track submission status |

---

## Key Workflows

### Form Creation (Admin)
1. Admin opens the Form Builder.
2. Adds fields (label, type, required flag, options for select/radio/checkbox).
3. Assigns an ordered verifier chain (Level 1 → Level 2 → …).
4. Optionally sets a deadline and publication status.
5. Saves — backend creates `Form` + `FormVerifierLevel` records and writes a `FORM_CREATED` audit log.

### Form Submission (User)
1. User browses open forms on the User Portal.
2. Fills in all required fields (including file uploads where applicable).
3. Submits — backend creates a `FormSubmissions` record at `currentLevel = 1` with `overallStatus = Pending`.

### Approval Pipeline (Verifier)
1. Level-1 verifier sees the new submission in their "Pending Approvals".
2. Verifier approves (or rejects with a remark).
3. Backend creates a `VerificationAction` record. If approved and more levels remain, `currentLevel` advances. If it was the last level, `overallStatus` becomes `Approved`. If rejected at any level, `overallStatus` becomes `Rejected`.
4. All verifiers in the chain can view the full action history.

### Audit Logging
Every POST/PATCH/DELETE operation on the backend writes an `AuditLog` entry recording:
- The specific `LogAction` (e.g., `SUBMISSION_CREATED`, `VERIFICATION_APPROVED`)
- The affected entity type and ID
- The actor's identity and type
- An optional JSON `diff` (before/after for updates) and `meta` (remarks, IP, etc.)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3/v4 |
| UI Components | shadcn/ui (Radix UI primitives) + Material UI (admin portal) |
| Icons | Lucide React, MUI Icons, React Icons |
| Charts | Recharts |
| Drag & Drop | React DnD (admin form builder) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion / Motion |
| Backend | Next.js API Routes |
| Authentication | NextAuth v4 (Google OAuth, JWT strategy) |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Notifications | Sonner (toast) |
| HTTP Client | Axios |
| Deployment | Vercel |

---

## Environment Variables

Each sub-project requires its own `.env.local` file. Below is the full set across all services.

### Backend (`backend/.env.local`)

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret"

# The backend's own public URL
NEXTAUTH_URL="http://localhost:4000"
```

### Admin Portal (`admin_portal/.env.local`)

```env
# Backend API base URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# NextAuth settings (shared secret with backend)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (same app credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Verifier Portal (`verifier portal/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### User Portal (`user_portal/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3002"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- PostgreSQL 14 or later
- A Google Cloud project with OAuth 2.0 credentials configured

### 1. Clone the repository

```bash
git clone <repo-url>
cd IIT_Ropar_Form_Management_Website-main
```

### 2. Set up the Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env.local   # or create manually (see Environment Variables)

# Push the database schema
npx prisma migrate deploy

# (Optional) Generate Prisma client
npx prisma generate

# Start the dev server on port 4000
npm run dev -- -p 4000
```

### 3. Set up the Admin Portal

```bash
cd ../admin_portal
npm install
# Create admin_portal/.env.local
npm run dev   # runs on http://localhost:3000
```

### 4. Set up the Verifier Portal

```bash
cd "../verifier portal"
npm install
# Create verifier portal/.env.local
npm run dev -- -p 3001   # runs on http://localhost:3001
```

### 5. Set up the User Portal

```bash
cd ../user_portal
npm install
# Create user_portal/.env.local
npm run dev -- -p 3002   # runs on http://localhost:3002
```

### 6. Seed the Database (optional)

With the backend running, call the seed endpoint once:

```bash
curl -X POST http://localhost:4000/api/insertDummyData
```

### 7. Create the first Admin

The first admin must be created directly in the database. After that admin signs in with Google, they can create additional verifiers via the Admin Portal.

```sql
INSERT INTO "Verifier" (id, "userName", email, role, department, "mobileNo", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Admin Name', 'admin@iitrpr.ac.in', 'Admin', 'Administration', '9999999999', now(), now());
```

---

## Deployment

The project is configured for Vercel monorepo deployment using `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/admin/(.*)",    "destination": "/admin_portal/$1" },
    { "source": "/verifier/(.*)", "destination": "/verifier portal/$1" },
    { "source": "/(.*)",          "destination": "/user_portal/$1" }
  ]
}
```

This routes all traffic through a single Vercel project:

| Path prefix | Served by |
|-------------|-----------|
| `/admin/…` | Admin Portal |
| `/verifier/…` | Verifier Portal |
| `/` (everything else) | User Portal |

The Backend should be deployed as a separate Vercel project (or any Node.js host) and its public URL set in the `NEXT_PUBLIC_API_URL` environment variable of each portal.

**Deployment checklist:**
1. Set all environment variables in the Vercel dashboard for each project.
2. Add the production URLs as authorised redirect URIs in Google Cloud Console.
3. Run `npx prisma migrate deploy` against the production database on first deploy.
4. Ensure the `public/uploads/` directory on the backend is writable (use an object storage service like AWS S3 or Cloudflare R2 for production file storage).

---

## Folder-Level READMEs

Each sub-project has its own focused README:

- [`backend/README.md`](./backend/README.md) — API routes reference, Prisma setup, auth flow
- [`admin_portal/README.md`](./admin_portal/README.md) — Admin dashboard pages, component structure, Form Builder details
- [`verifier portal/README.md`](./verifier%20portal/README.md) — Verifier workflow, portal pages, auth hooks
- [`user_portal/README.md`](./user_portal/README.md) — Student journey, form submission flow, status tracker