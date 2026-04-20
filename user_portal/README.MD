# User Portal — IIT Ropar Form Management

The User Portal is the student-facing interface of the IIT Ropar Form Management System. Students log in with their institutional Google account to browse available forms, submit applications, and track their submissions through the multi-level approval pipeline in real time.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [Form Submission Flow](#form-submission-flow)
- [Status Tracker](#status-tracker)
- [Authentication & Route Protection](#authentication--route-protection)
- [Running Locally](#running-locally)

---

## Overview

The User Portal is a **Next.js 16 (App Router)** application. It is the default route in the Vercel deployment — any URL that doesn't match `/admin/` or `/verifier/` is served by this portal.

Students do **not** need to register manually. On their first Google sign-in, an account is automatically created in the database. They can immediately browse open forms and submit applications.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.2 | App Router framework |
| TypeScript | ^5.8 | Language |
| Tailwind CSS | ^3.4 | Styling |
| shadcn/ui | (Radix UI) | UI component primitives |
| NextAuth | ^4.24 | Authentication (Google OAuth, JWT) |
| React Hook Form | ^7.61 | Form state management |
| Zod | ^3.25 | Form validation schema |
| @tanstack/react-query | ^5 | Server state management & data fetching |
| Axios | ^1.13 | HTTP client |
| Framer Motion | ^12 | Animations |
| Sonner | ^1.7 | Toast notifications |
| Lucide React | ^0.462 | Icons |
| clsx + tailwind-merge | latest | Conditional class utilities |

---

## Project Structure

```
user_portal/
├── public/                            ← Static assets
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← Root layout (providers, fonts)
│   │   ├── globals.css                ← Global Tailwind styles
│   │   ├── page.tsx                   ← Root redirect → /dashboard
│   │   ├── not-found.tsx              ← 404 page
│   │   │
│   │   ├── login/page.tsx             ← Google sign-in page
│   │   │
│   │   └── (dashboard)/              ← Auth-gated route group
│   │       ├── layout.tsx             ← Injects Navbar + sidebar layout
│   │       ├── dashboard/page.tsx     ← Student dashboard overview
│   │       ├── forms/
│   │       │   ├── page.tsx           ← Browse available forms
│   │       │   └── [formId]/page.tsx  ← Form detail + submission UI
│   │       ├── history/page.tsx       ← All past submissions
│   │       ├── profile/page.tsx       ← Student's profile
│   │       └── submission/
│   │           └── [submissionId]/page.tsx ← Submission detail + status tracker
│   │
│   ├── components/
│   │   ├── Navbar.tsx                 ← Top navigation bar (user menu, links)
│   │   ├── StatusBadge.tsx            ← Coloured status chip (Pending/Approved/Rejected)
│   │   ├── StatusTracker.tsx          ← Visual multi-level approval progress tracker
│   │   ├── providers.tsx              ← Wraps children with NextAuth SessionProvider
│   │   └── ui/                        ← shadcn/ui primitive components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── radio-group.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       └── textarea.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx            ← React context providing session data globally
│   │
│   ├── lib/
│   │   ├── services.ts                ← All API call functions (backend integration)
│   │   ├── mockApi.ts                 ← Mock data for local development without backend
│   │   └── utils.ts                   ← Utility helpers (cn, date formatting)
│   │
│   └── types/
│       └── next-auth.d.ts             ← TypeScript augmentation for session fields
│
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── postcss.config.js
└── tsconfig.json
```

---

## Environment Variables

Create `user_portal/.env.local`:

```env
# URL of the running backend API server
BACKEND_URL = "http://localhost:3001"

```

---

## Pages & Features

### Login (`/login`)

A minimal sign-in page showing the IIT Ropar logo and a "Sign in with Google" button. Authenticated users are automatically redirected to `/dashboard`. Regular users (students) can sign in freely — their account is created automatically on first login.

### Dashboard (`/dashboard`)

The home screen after login:

- **Welcome banner** with the student's name.
- **Quick stats** — number of open forms available, active submissions in progress, total submissions.
- **Recent submissions panel** — last 5 submissions with current status.
- **Available Forms quick-access** — tiles for the 3 most recently opened forms.

### Browse Forms (`/forms`)

Lists all currently open forms with:

- Form title and description.
- Deadline (if set), displayed with urgency styling if close.
- "Apply" button linking to the form submission page.
- Forms that are closed do not appear in this list.

### Form Submission (`/forms/[formId]`)

The form-filling page. Dynamically renders all fields defined in the form's JSON schema:

| Field Type | Rendered As |
|------------|-------------|
| `text` | Text input |
| `number` | Number input |
| `email` | Email input |
| `tel` | Tel/phone input |
| `date` | Date picker |
| `textarea` | Multi-line text area |
| `select` | Dropdown select |
| `radio` | Radio button group |
| `checkbox` | Checkbox group (multi-select) |
| `file` | File upload input |

**Validation** is performed using React Hook Form + Zod before the form is submitted:
- Required fields cannot be empty.
- Email fields validate format.
- Number fields validate numeric type.
- File fields validate that a file has been selected.

On submit, the portal calls the backend's `/api/form/submitForm` endpoint with `multipart/form-data` (to support file uploads). A success toast and redirect to the submission detail page follow a successful response.

If the form has a deadline that has passed, the submission button is disabled and a message is shown.

### Submission Detail (`/submission/[submissionId]`)

Shows a single submission in full:

- **Submitted data** — All field labels and the student's answers, including file download links.
- **Status Badge** — Overall status (Pending / Approved / Rejected).
- **Status Tracker** — Visual component (see below).
- **Timestamps** — When the form was submitted and last updated.

### Submission History (`/history`)

A table of all the student's submissions across all forms:

- Form name.
- Submission date.
- Current status with colour-coded badge.
- Link to the submission detail page.

Sorted newest first by default.

### Profile (`/profile`)

Shows the student's account details:

- Name (from Google account).
- Email address.
- Member since date.
- Total submissions count.

---

## Form Submission Flow

```
Student visits /forms
        │
        ▼
Browses open forms → clicks "Apply"
        │
        ▼
/forms/[formId] — Dynamic fields rendered from JSON schema
        │
User fills in fields, attaches files if required
        │
        ▼
Clicks "Submit" → React Hook Form validates all fields
        │
   Validation fails?
   ├─ Yes → Error messages shown inline, submission blocked
   └─ No  → POST to /api/form/submitForm (multipart/form-data)
                │
                ▼
         Backend creates FormSubmissions record
         currentLevel = 1, overallStatus = Pending
                │
                ▼
         Redirect to /submission/[newSubmissionId]
         Student sees StatusTracker at Level 1 (pending)
```

---

## Status Tracker

The `StatusTracker` component (`src/components/StatusTracker.tsx`) renders the multi-level approval pipeline visually:

```
●───────────●───────────●
Level 1     Level 2     Level 3
(Approved)  (Pending)   (Not reached)
HOD         Dean
```

Each node in the chain shows:
- **Verifier name and role** (displayed without revealing contact details).
- **Status icon** — Checkmark (approved), X (rejected), clock (pending), grey dot (not yet reached).
- **Action timestamp** and **remark** (if a remark was left by the verifier).
- The current level is highlighted with an animated pulse indicator.

If the submission is **Rejected** at any level, the remaining levels are greyed out to show they were skipped.

---

## Authentication & Route Protection

### Route Group `(dashboard)`

All pages under `src/app/(dashboard)/` share a layout (`layout.tsx`) that:
1. Calls `getServerSession()` on the server.
2. If the session is missing or the `portal` is not `"user"`, redirects to `/login`.
3. If authenticated, renders the `Navbar` and page content.

### `AuthContext`

`src/contexts/AuthContext.tsx` provides a React context that stores the authenticated user's session data (ID, name, email) globally. Components can use `useAuth()` to access this without passing props.

### `providers.tsx`

Wraps the application with `SessionProvider` from `next-auth/react` so client components can call `useSession()`.

### Automatic Account Creation

Students do not need to be pre-registered. On first Google sign-in, the backend's NextAuth `signIn` callback upserts a `User` record:

```typescript
await prisma.user.upsert({
  where:  { email: user.email },
  update: { userName: user.name },
  create: { userName: user.name, email: user.email },
});
```

---

## API Integration (`lib/services.ts`)

All backend calls are centralised in `lib/services.ts`. Example functions:

```typescript
// Fetch all open forms
getPublicForms(): Promise<Form[]>

// Fetch a single form's definition
getFormById(formId: string): Promise<Form>

// Submit a filled form
submitForm(formId: string, formData: FormData): Promise<Submission>

// Get the authenticated user's submissions
getMySubmissions(): Promise<Submission[]>

// Get a single submission with the verification timeline
getSubmissionById(submissionId: string): Promise<SubmissionDetail>
```

### Mock API (`lib/mockApi.ts`)

During early development (before the backend is running), `lib/mockApi.ts` provides static mock responses for every API function. Switch between real and mock API by changing the import in pages or services.

---

## Running Locally

```bash
# From the repository root
cd user_portal

# Install dependencies
npm install

# Create environment file
# (copy the variables from the Environment Variables section above into .env.local)

# Ensure the backend is running on port 4000
# then start the user portal
npm run dev -- -p 3000
# Runs at http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```