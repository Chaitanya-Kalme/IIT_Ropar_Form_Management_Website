# Verifier Portal — IIT Ropar Form Management

The Verifier Portal is the review interface for IIT Ropar staff members (HOD, Dean, Caretaker, Faculty, Assistant Registrar, Mess Manager) who are assigned to verify student form submissions. It surfaces only the submissions and forms relevant to each verifier's role in the approval chain.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [Authentication & Route Protection](#authentication--route-protection)
- [Verification Workflow](#verification-workflow)
- [Running Locally](#running-locally)

---

## Overview

The Verifier Portal is a **Next.js 16 (App Router)** application. It connects exclusively to the **backend API** server for all data — it has no database connection of its own. Only users whose email exists in the `Verifier` table (registered by an admin) and who do not have the `Admin` role can access this portal.

Each verifier sees:
- Forms they have been assigned to as a reviewer (at any level).
- Submissions currently sitting at their specific level (actionable).
- Their full action history.
- A read-only view of all submissions across their assigned forms.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.2 | App Router framework |
| TypeScript | ^5 | Language |
| Tailwind CSS | ^3 | Styling |
| NextAuth | ^4.24 | Authentication (Google OAuth, JWT) |
| Lucide React | ^0.383 | Icons |
| Recharts | ^2.12 | Dashboard charts |
| Sonner | ^2.0 | Toast notifications |
| clsx | ^2 | Conditional class names |

---

## Project Structure

```
verifier portal/
├── public/                            ← Static assets
│
├── app/                               ← Next.js App Router pages
│   ├── layout.tsx                     ← Root layout (session provider, theme)
│   ├── globals.css                    ← Global styles
│   ├── page.tsx                       ← Root redirect → /dashboard
│   │
│   ├── login/page.tsx                 ← Google sign-in page
│   ├── dashboard/page.tsx             ← Verifier dashboard (stats + summary)
│   ├── profile/page.tsx               ← Verifier's own profile
│   ├── activity/page.tsx              ← This verifier's action history
│   │
│   ├── assigned-forms/
│   │   ├── page.tsx                   ← All forms assigned to this verifier
│   │   └── [id]/page.tsx             ← Form detail with submission list
│   │
│   ├── pending-approvals/
│   │   └── page.tsx                   ← Submissions awaiting this verifier's action
│   │
│   ├── all-submissions/
│   │   └── page.tsx                   ← Read-only view of all submissions
│   │
│   └── form-details/
│       └── [id]/page.tsx             ← Full submission review screen
│
├── components/
│   └── layout/
│       ├── DashboardLayout.tsx        ← Sidebar + main content wrapper
│       ├── Navbar.tsx                 ← Top navigation bar
│       └── Sidebar.tsx                ← Navigation sidebar with route links
│
├── hooks/
│   └── useRequireAuth.ts             ← Client-side auth guard hook
│
├── lib/
│   ├── app-context.tsx               ← Global React context (user session data)
│   ├── auth.service.ts               ← Authentication helper functions
│   ├── data.ts                        ← API fetch functions (all backend calls)
│   ├── session-provider.tsx          ← NextAuth SessionProvider wrapper
│   └── theme.tsx                      ← Theme configuration
│
├── types/
│   └── next-auth.d.ts                ← TypeScript augmentation for session fields
│
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Environment Variables

Create `verifier portal/.env.local`:

```env
# URL of the running backend API server
BACKEND_URL = "http://localhost:3001"

```
---

## Pages & Features

### Login (`/login`)

A clean sign-in page with "Sign in with Google" button. The page redirects authenticated users directly to `/dashboard`. Only emails registered in the `Verifier` table (excluding `Admin` role) are given access to this portal.

### Dashboard (`/dashboard`)

The first page seen after login. Provides:

- **Summary cards** — Number of assigned forms, total submissions across those forms, pending submissions awaiting the verifier's action, completed verifications.
- **Recent Pending Approvals** — A short list of the newest submissions waiting for this verifier, with quick links to review them.
- **Verification Stats** — Breakdown of the verifier's actions (approved vs. rejected counts).

### Assigned Forms (`/assigned-forms`)

Lists all forms where this verifier appears in the verification chain at any level:

- Form title and description.
- This verifier's level in the chain for each form.
- Open/closed status badge.
- Total submissions count for each form.
- Click-through to the form's submission list.

### Assigned Form Detail (`/assigned-forms/[id]`)

Shows all submissions for a specific form that are relevant to this verifier:

- Table with submission date, submitter name, current status, and the verifier's action (if already taken).
- Click-through to the full submission review screen.

### Pending Approvals (`/pending-approvals`)

The primary action page. Lists all submissions currently waiting at this verifier's level:

- Submitter name and email.
- Form name.
- Submission date.
- Summary of the form data (key fields visible inline).
- "Review" button → opens the full submission detail page.

Submissions disappear from this list once the verifier acts on them (approves or rejects) or if the submission is rejected at a previous level.

### All Submissions (`/all-submissions`)

A read-only view of every submission across all forms assigned to this verifier:

- Includes submissions at all statuses (Pending, Approved, Rejected).
- Shows the submission's current level and overall status.
- Useful for tracking the full history of what went through this verifier's forms.

### Form Details / Review Screen (`/form-details/[id]`)

The most important page for a verifier's daily workflow. Displays:

- **Submitter information** — Name, email, submission date.
- **Form field values** — All fields filled in by the student, rendered in their original layout. File fields show download/preview links.
- **Verification timeline** — Visual chain showing each level's verifier, their action, timestamp, and remark (if any). The current pending level is highlighted.
- **Action buttons** (only shown if the submission is currently at this verifier's level and not yet acted on):
  - **Approve** — Moves the submission to the next level (or to `Approved` if this is the final level).
  - **Reject** — Marks the submission as `Rejected` with a required remark.
  - **Remark field** — Optional for approval, required for rejection.

### Activity (`/activity`)

A chronological log of all actions this verifier has taken:

- Action type (Approved / Rejected).
- Form name.
- Submission ID.
- Remark (if any).
- Timestamp.

### Profile (`/profile`)

Displays the verifier's account details fetched from the backend:

- Name, email, role, department, mobile number.
- Registration date.

---

## Authentication & Route Protection

### `useRequireAuth` Hook

A custom client-side hook (`hooks/useRequireAuth.ts`) that checks the NextAuth session on every page. If the session is missing or the user's `portal` is not `"verifier"`, the user is redirected to `/login`.

Usage in page components:

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function DashboardPage() {
  useRequireAuth();    // Redirects to /login if not authenticated as verifier
  // ... page content
}
```

### `AppContext`

The `lib/app-context.tsx` provides a React context that stores the authenticated verifier's session data (ID, name, email, role) globally so any child component can access it without prop drilling.

### Server-side Enforcement (Backend)

The backend independently verifies every verifier API call:
1. Calls `getServerSession(authOptions)`.
2. Checks `session.user.portal === "verifier"` or `"admin"`.
3. Re-confirms the verifier's ID exists in the `Verifier` table (guards against post-login account deletion).

This means even if client-side guards are bypassed, the API layer blocks unauthorized access.

---

## Verification Workflow

Here is how a submission flows through the verifier's experience:

```
Student submits form
        │
        ▼
Submission appears in Level-1 Verifier's "Pending Approvals"
        │
   [Verifier Reviews]
        │
   ┌────┴────┐
   │         │
Approve    Reject
   │         │
   │         └──► Submission marked Rejected (all subsequent levels skipped)
   │
   ▼
If more levels → submission moves to Level-2 Verifier's "Pending Approvals"
If final level → submission marked Approved
```

The verifier can only act on submissions at **their exact level**. They cannot skip ahead or act on behalf of another verifier. Once they approve or reject, the action is recorded as a `VerificationAction` row and a `VERIFICATION_APPROVED` or `VERIFICATION_REJECTED` audit log entry.

---

## Running Locally

```bash
# From the repository root
cd "verifier portal"

# Install dependencies
npm install

# Create environment file
# (copy the variables from the Environment Variables section above into .env.local)

# Ensure the backend is running on port 4000
# then start the verifier portal
npm run dev -- -p 3000
# Runs at http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```