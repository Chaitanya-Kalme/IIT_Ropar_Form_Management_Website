# Admin Portal — IIT Ropar Form Management

The Admin Portal is the central control panel for system administrators. It provides a full-featured dashboard to manage forms, verifiers, users, and audit logs for the IIT Ropar Form Management System.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [Component Architecture](#component-architecture)
- [Authentication & Route Protection](#authentication--route-protection)
- [Running Locally](#running-locally)

---

## Overview

The Admin Portal is a **Next.js 16 (App Router)** application accessible only to users whose email is registered with the `Admin` role in the system. It communicates exclusively with the **backend API** server — it does not have its own database connection.

Key responsibilities of the Admin Portal:

- Build and manage dynamic forms with a drag-and-drop field editor.
- Configure ordered multi-level verification chains per form.
- Register, update, and remove verifier accounts.
- Monitor all form submissions and pending approvals across the system.
- View a real-time, filterable audit activity log.
- Manage student (user) accounts.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.1 | App Router framework |
| TypeScript | ^5 | Language |
| Tailwind CSS | ^3.4 | Styling |
| shadcn/ui | (Radix UI) | Core UI components |
| Material UI | ^7.3 | Additional components (data tables, icons) |
| React DnD | 16.0 | Drag-and-drop for form field reordering |
| Recharts | 2.15 | Dashboard charts |
| React Hook Form | 7.55 | Form state management |
| NextAuth | ^4.24 | Authentication (Google OAuth, JWT) |
| Axios | ^1.13 | HTTP client for API calls |
| Sonner | 2.0 | Toast notifications |
| Lucide React | 0.487 | Icons |
| Motion | 12.x | Animations |

---

## Project Structure

```
admin_portal/
├── public/
│   ├── favicon.png
│   ├── logo.jpg
│   └── logo.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout (fonts, global providers)
│   │   ├── page.tsx                    ← Root redirect → /dashboard
│   │   │
│   │   ├── (protected)/               ← Auth-gated route group
│   │   │   ├── layout.tsx             ← Injects MainLayout (sidebar + navbar)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── available/
│   │   │   │   │   ├── page.tsx       ← All available forms list
│   │   │   │   │   └── [formId]/
│   │   │   │   │       ├── page.tsx   ← Form detail & submissions
│   │   │   │   │       └── edit/page.tsx ← Form editor
│   │   │   │   ├── all/
│   │   │   │   │   ├── page.tsx       ← All submissions list
│   │   │   │   │   └── [submissionId]/page.tsx ← Submission detail
│   │   │   │   ├── create/page.tsx    ← New form creation
│   │   │   │   └── pending/page.tsx   ← Pending approvals dashboard
│   │   │   │
│   │   │   ├── members/
│   │   │   │   ├── add/page.tsx       ← Register new verifier
│   │   │   │   └── all/
│   │   │   │       ├── page.tsx       ← Verifier list
│   │   │   │       └── [memberId]/
│   │   │   │           ├── page.tsx   ← Verifier profile
│   │   │   │           └── edit/page.tsx ← Edit verifier
│   │   │   │
│   │   │   └── users/page.tsx         ← Student user list
│   │   │
│   │   ├── login/page.tsx             ← Google sign-in page
│   │   └── api/
│   │       └── files/uploads/[...path]/route.ts  ← File proxy route
│   │
│   └── components/
│       ├── layout/
│       │   ├── MainLayout.tsx         ← Sidebar + content area wrapper
│       │   ├── Sidebar.tsx            ← Navigation sidebar with route links
│       │   └── TopNavbar.tsx          ← Top bar (user menu, breadcrumbs)
│       │
│       ├── forms/
│       │   ├── FormBuilderPage.tsx    ← Form creation/editing UI (main component)
│       │   ├── AllSubmittedFormsPage.tsx ← Submissions table with filters
│       │   └── PendingApprovalsPage.tsx  ← Pending submissions view
│       │
│       ├── members/
│       │   └── MemberFormPage.tsx     ← Create/edit verifier form
│       │
│       ├── activity/
│       │   └── ActivityLogsPage.tsx   ← Paginated audit log UI
│       │
│       ├── figma/
│       │   └── ImageWithFallback.tsx  ← Image component with error fallback
│       │
│       └── ui/                        ← shadcn/ui primitive components
│           ├── accordion.tsx
│           ├── alert-dialog.tsx
│           ├── button.tsx
│           ├── card.tsx
│           ├── chart.tsx              ← Recharts wrapper
│           ├── dialog.tsx
│           ├── dropdown-menu.tsx
│           ├── form.tsx
│           ├── input.tsx
│           ├── select.tsx
│           ├── table.tsx
│           ├── toast.tsx
│           └── ... (30+ components)
│
├── middleware.ts                       ← NextAuth route protection middleware
├── next.config.mjs
├── package.json
├── postcss.config.js
└── tsconfig.json
```

---

## Environment Variables

Create `admin_portal/.env.local`:
```env
# URL of the running backend API server
BACKEND_URL = "http://localhost:3001"

```

---

## Pages & Features

### Dashboard (`/dashboard`)

The landing page after login. Displays:

- **KPI Cards** — Total forms, total verifiers, total users, pending submissions count, approved submissions, rejected submissions.
- **Submission Status Chart** — A Recharts bar/pie chart showing submission counts by status.
- **Recent Activity Feed** — Latest audit log events.
- **Quick Actions** — Shortcuts to create a form, add a member, view pending approvals.

### Form Builder (`/forms/create` and `/forms/available/[formId]/edit`)

The most complex page in the portal. Features:

- **Field Editor** — Add fields of types: `text`, `number`, `date`, `email`, `tel`, `file`, `checkbox`, `radio`, `select`, `textarea`.
- **Per-field settings** — Label, required toggle, placeholder, options list (for radio/select/checkbox).
- **Drag-and-Drop Reordering** — Fields can be reordered by dragging using React DnD.
- **Verifier Chain Builder** — Search and add verifiers by name/role. Assign each verifier an ordered level (1, 2, 3, …). Levels can be reordered.
- **Form Metadata** — Title, description, optional deadline, open/closed status toggle.
- **Validation** — All required fields are validated before the create/update API call is made.
- **Audit Trail** — On save, a `FORM_CREATED` or `FORM_UPDATED` log entry is written by the backend.

### Available Forms (`/forms/available`)

Lists all forms in the system (open and closed) with:

- Status badge (Open / Closed).
- Deadline display.
- Submission count.
- Links to view submissions and edit the form.
- Toggle to open/close the form.

### Form Detail (`/forms/available/[formId]`)

Shows the full form definition and all submissions for that form:

- Field list with types.
- Verifier chain with assigned levels.
- Submissions table with status, submitter name, and date.
- Link to individual submission detail.

### All Submissions (`/forms/all`)

System-wide list of every submission with:

- Filter by form, status, and date range.
- Pagination.
- Click-through to individual submission detail.

### Submission Detail (`/forms/all/[submissionId]`)

Full view of a single submission:

- Submitted field values (including file download links).
- Verification timeline — each level's verifier, their action (approved/rejected), timestamp, and remark.
- Current status badge.

### Pending Approvals (`/forms/pending`)

Admin-level view of all submissions still waiting for any verifier action. Allows admins to monitor bottlenecks.

### Member Management (`/members/all`)

Table of all registered verifiers:

- Columns: Name, email, role, department, mobile number.
- Search/filter.
- Edit and delete actions.

### Add / Edit Member (`/members/add` and `/members/all/[memberId]/edit`)

Form to create or update a verifier account with fields:

- Full name
- Email
- Role (dropdown: HOD, Dean, Caretaker, Faculty, Assistant Registrar, Mess Manager)
- Department
- Mobile number

### User Management (`/users`)

Read-only table of all student (User model) accounts who have signed in at least once:

- Name, email, registration date.
- Total submissions count.

### Activity Log (`/activity`)

Paginated, filterable view of the `AuditLog` table:

- Filter by action type, actor, date range.
- Shows what happened, who did it, on what entity, and when.
- Expandable rows showing `diff` (before/after) for update actions.

### Settings (`/settings`)

Admin's own profile page — name, email (read-only), role.

---

## Component Architecture

The portal follows a **page → feature component → UI primitive** pattern:

- **Pages** (`app/(protected)/*/page.tsx`) are thin shells that import a single feature component.
- **Feature components** (`components/forms/`, `components/members/`, `components/activity/`) contain all the business logic, API calls, and state management for their domain.
- **UI primitives** (`components/ui/`) are unstyled/minimally-styled shadcn/ui components (buttons, inputs, dialogs, etc.) that are composed inside feature components.
- **Layout components** (`components/layout/`) provide the persistent sidebar and navbar shared across all protected pages.

### Sidebar Navigation Links

| Label | Route |
|-------|-------|
| Dashboard | `/dashboard` |
| Forms → Available | `/forms/available` |
| Forms → Create | `/forms/create` |
| Forms → All Submissions | `/forms/all` |
| Forms → Pending | `/forms/pending` |
| Members → All | `/members/all` |
| Members → Add | `/members/add` |
| Users | `/users` |
| Activity | `/activity` |
| Settings | `/settings` |

---

## Authentication & Route Protection

Protection is implemented at two layers:

### 1. `middleware.ts` (Edge Middleware)

Uses NextAuth's `withAuth` helper to intercept all requests to `/(protected)/**` routes. Unauthenticated requests are redirected to `/login`. The middleware also checks `token.portal === "admin"` — if a verifier or user somehow reaches the admin portal URL, they are redirected away.

### 2. Server-side Role Check (Backend)

Every Admin Portal API call hits a backend endpoint that independently calls `getServerSession()` and verifies `session.user.role === "Admin"`. This means even if the middleware is bypassed, the API will reject non-admin requests with a `401`.

### Login Flow

1. User visits `/login`.
2. Clicks "Sign in with Google".
3. Google OAuth flow completes; NextAuth creates a JWT with `role = "Admin"` and `portal = "admin"`.
4. User is redirected to `/dashboard`.

---

## Running Locally

```bash
# From the repository root
cd admin_portal

# Install dependencies
npm install

# Create environment file
# (copy the variables from the Environment Variables section above into .env.local)

# Ensure the backend is running on port 4000
# then start the admin portal
npm run dev
# Runs at http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```