# Backend — IIT Ropar Form Management

This is the central API server for the IIT Ropar Form Management System. Built with **Next.js API Routes**, it serves all three front-end portals (Admin, Verifier, User) and is the only part of the system that directly communicates with the PostgreSQL database via **Prisma ORM**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [File Uploads](#file-uploads)
- [Audit Logging](#audit-logging)
- [Running Locally](#running-locally)
- [Running in Production](#running-in-production)

---

## Overview

The backend is a **headless Next.js app** — it has no UI pages of its own (except a minimal root page). Its purpose is to expose a structured REST API that:

- Authenticates users via **Google OAuth** (NextAuth v4, JWT strategy).
- Performs all **database reads and writes** through Prisma.
- Enforces **role-based access control** on every endpoint.
- Records every mutating operation in an **immutable audit log**.
- Serves **uploaded files** through a secure catch-all route.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.2 | API Routes framework |
| TypeScript | ^5 | Language |
| NextAuth | ^4.24 | Google OAuth + JWT sessions |
| Prisma | ^6.19 | ORM |
| `@prisma/adapter-pg` | ^6.19 | PostgreSQL driver adapter |
| `pg` | ^8.20 | PostgreSQL client |
| Tailwind CSS | ^4 | (minimal, global styles only) |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma            ← Database schema (models, enums, relations)
│   └── migrations/              ← SQL migration history
│       └── 20260324192205_niit/
│           └── migration.sql
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       ├── options.ts   ← NextAuth config (providers, callbacks)
│   │   │   │       └── route.ts     ← NextAuth handler export
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/route.ts
│   │   │   │   ├── getAllMembers/route.ts
│   │   │   │   ├── registerVerifier/route.ts
│   │   │   │   ├── updateVerifier/[memberId]/route.ts
│   │   │   │   ├── deleteMember/[memberId]/route.ts
│   │   │   │   └── getVerifierMemberDetails/[verifierId]/route.ts
│   │   │   │
│   │   │   ├── form/
│   │   │   │   ├── createForm/route.ts
│   │   │   │   ├── getAllForms/route.ts
│   │   │   │   ├── getForm/[formId]/route.ts
│   │   │   │   ├── getPublicForms/route.ts
│   │   │   │   └── updateForm/[formId]/route.ts
│   │   │   │
│   │   │   ├── submissions/
│   │   │   │   ├── [id]/route.ts             ← GET detail, POST verify action
│   │   │   │   ├── getAllSubmissions/route.ts
│   │   │   │   └── getMySubmissions/route.ts
│   │   │   │
│   │   │   ├── verifier/
│   │   │   │   ├── activity/route.ts
│   │   │   │   ├── all-submissions/route.ts
│   │   │   │   ├── getAssignedForms/route.ts
│   │   │   │   ├── getFormDetails/[id]/route.ts
│   │   │   │   └── pending-approvals/route.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── getAllUsers/route.ts
│   │   │   │
│   │   │   ├── user/
│   │   │   │   └── profile/route.ts
│   │   │   │
│   │   │   ├── logs/route.ts
│   │   │   └── insertDummyData/route.ts      ← Dev-only seeding endpoint
│   │   │
│   │   ├── uploads/
│   │   │   └── [...path]/route.ts            ← Static file serving
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       ├── prisma.ts             ← Singleton Prisma client
│       ├── logHelper.ts          ← Typed audit log query helpers
│       └── users.query.ts        ← Reusable user lookup helpers
│
├── public/
│   └── uploads/                  ← User-uploaded files stored here
│       └── <userId>/             ← Scoped per user ID
│
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## Environment Variables

Create a file at `backend/.env.local`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

# Google OAuth (from Google Cloud Console → APIs & Services → Credentials)
GOOGLE_CLIENT_ID="xxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"


```

> **Important:** `NEXTAUTH_URL` must exactly match the URL you open in the browser, including the port. In production, set it to your backend's deployed domain (e.g., `https://api.yourproject.vercel.app`).

---

## Database Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Apply migrations

```bash
npx prisma migrate deploy
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

The generated client is output to `backend/generated/prisma/` as specified in `schema.prisma`.

### 4. Verify the schema

```bash
npx prisma studio    # Opens a browser-based DB explorer at http://localhost:5555
```

### 5. Create the first Admin user

The first administrator must be inserted directly into the database. After this, the Admin Portal can be used to register all other verifiers.

```sql
INSERT INTO "Verifier" (
  id, "userName", email, role, department, "mobileNo", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Admin Name',
  'admin@iitrpr.ac.in',
  'Admin',
  'Administration',
  '9999999999',
  now(),
  now()
);
```

---

## Authentication

Authentication uses **NextAuth v4** configured in `src/app/api/auth/[...nextauth]/options.ts`.

### Provider

- **Google OAuth** — All sign-ins use institutional Google accounts. No password registration.

### Session Strategy

- **JWT** — Sessions are stateless tokens. No database session table required.

### Sign-in Callback Flow

1. NextAuth receives the Google profile.
2. The `signIn` callback checks if the email belongs to a `Verifier` record.
   - If yes → verifier is allowed in directly.
   - If no → a `User` record is upserted (created on first login, updated on subsequent logins).
3. Returns `true` (allow) or `false` (deny).

### JWT Callback Enrichment

After sign-in, the `jwt` callback resolves the actor's identity:

| Scenario | Token fields set |
|----------|-----------------|
| Email found in `Verifier` with `role = Admin` | `id`, `role = "Admin"`, `portal = "admin"` |
| Email found in `Verifier` with any other role | `id`, `role`, `portal = "verifier"` |
| Email not in `Verifier` (regular user) | `id`, `role = "User"`, `portal = "user"` |

### Session Callback

Exposes `user.id`, `user.role`, and `user.portal` to the client session.

### Role Enforcement on Endpoints

Every API route calls `getServerSession(authOptions)` and checks `session.user.role` or `session.user.portal` before proceeding. Unauthorized requests receive a `401` or `403` response.

---

## API Reference

All endpoints are prefixed with `/api/`. Methods and access levels are listed below.

### Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Public | NextAuth handler (sign in, sign out, session) |

### Admin Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | Dashboard statistics (form count, user count, submission counts, recent activity) |
| GET | `/api/admin/getAllMembers` | Admin | List all verifier accounts |
| POST | `/api/admin/registerVerifier` | Admin | Create a new verifier account |
| PATCH | `/api/admin/updateVerifier/[memberId]` | Admin | Update verifier details |
| DELETE | `/api/admin/deleteMember/[memberId]` | Admin | Delete a verifier account |
| GET | `/api/admin/getVerifierMemberDetails/[verifierId]` | Admin | Get full details of a single verifier |

### Form Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/form/createForm` | Admin | Create a new form with fields and verifier chain |
| GET | `/api/form/getAllForms` | Admin | Get all forms (open and closed) |
| GET | `/api/form/getForm/[formId]` | Admin/Verifier | Get form definition by ID |
| GET | `/api/form/getPublicForms` | User | Get all currently open (active) forms |
| PATCH | `/api/form/updateForm/[formId]` | Admin | Update form fields, verifier chain, status, or deadline |

**createForm / updateForm request body:**

```json
{
  "title": "Leave Application",
  "description": "Apply for leave from classes",
  "deadline": "2026-05-31T23:59:59.000Z",
  "formStatus": true,
  "fields": [
    { "label": "Reason", "type": "textarea", "required": true },
    { "label": "Start Date", "type": "date", "required": true },
    { "label": "Type", "type": "select", "required": true, "options": ["Medical", "Personal", "Academic"] }
  ],
  "verifiers": [
    { "verifierId": "uuid-of-level-1-verifier", "level": 1 },
    { "verifierId": "uuid-of-level-2-verifier", "level": 2 }
  ]
}
```

**Allowed field types:** `text`, `number`, `date`, `file`, `checkbox`, `radio`, `select`, `textarea`, `email`, `tel`

### Submission Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/form/submitForm` | User | Submit a filled form (supports multipart/form-data for file fields) |
| GET | `/api/submissions/[id]` | User (own) / Verifier / Admin | Get full submission detail with verification timeline |
| POST | `/api/submissions/[id]` | Verifier / Admin | Approve or reject the submission at the current level |
| GET | `/api/submissions/getAllSubmissions` | Admin | Paginated list of all submissions |
| GET | `/api/submissions/getMySubmissions` | User | List of the authenticated user's own submissions |

**Verification action request body:**

```json
{
  "action": "Approved",
  "remark": "Looks good."
}
```

`action` must be `"Approved"` or `"Rejected"`.

### Verifier Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/verifier/getAssignedForms` | Verifier | All forms where this verifier appears in the chain |
| GET | `/api/verifier/pending-approvals` | Verifier | Submissions currently at this verifier's level |
| GET | `/api/verifier/all-submissions` | Verifier | All submissions across all assigned forms (read-only) |
| GET | `/api/verifier/getFormDetails/[id]` | Verifier | Full submission detail for the verifier's review screen |
| GET | `/api/verifier/activity` | Verifier | This verifier's own approval/rejection history |

### User Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users/getAllUsers` | Admin | List all registered user (student) accounts |
| GET | `/api/user/profile` | User | Get the authenticated user's profile |

### Logs Endpoint

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/logs` | Admin | Paginated, filterable audit log |

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 20) |
| `action` | LogAction | Filter by specific action type |
| `actorType` | `User\|Verifier\|System` | Filter by actor type |
| `actorUserId` | UUID | Filter by user actor |
| `actorVerifierId` | UUID | Filter by verifier actor |
| `entity` | string | Entity type (e.g., `Form`, `FormSubmissions`) |
| `formId` | number | Filter by form ID |
| `submissionId` | UUID | Filter by submission ID |
| `from` | ISO date | Start of date range |
| `to` | ISO date | End of date range |
| `sortOrder` | `asc\|desc` | Sort direction (default: `desc`) |

### File Serving

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/files/uploads/[...path]` | Authenticated | Stream a file from `public/uploads/` |

The catch-all path mirrors the filesystem layout under `public/uploads/`. Files are served with their original content type header.

---

## File Uploads

When a form has fields of type `file`, the `submitForm` endpoint accepts `multipart/form-data`. Uploaded files are written to:

```
backend/public/uploads/<userId>/<timestamp>-<originalFilename>
```

Files are later served through `/api/files/uploads/[...path]` which:
1. Resolves the filesystem path.
2. Checks that the requester is authenticated.
3. Streams the file with the correct `Content-Type` header.

> **Production Note:** The `public/uploads/` directory is ephemeral on serverless hosts. For production deployments, replace the local file system writes with an object storage SDK (AWS S3, Cloudflare R2, etc.) and update the serving route accordingly.

---

## Audit Logging

Every mutating operation records an `AuditLog` entry. The `logHelper.ts` library provides typed query helpers for retrieving logs.

### Log Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `action` | `LogAction` | What happened (e.g., `FORM_CREATED`, `VERIFICATION_APPROVED`) |
| `entity` | string | Affected model name (e.g., `"Form"`, `"FormSubmissions"`) |
| `entityId` | string | Primary key of the affected record |
| `actorType` | `ActorType` | `User`, `Verifier`, or `System` |
| `actorUserId` | UUID? | Set when a student performed the action |
| `actorVerifierId` | UUID? | Set when a verifier performed the action |
| `formId` | number? | Quick filter reference |
| `submissionId` | UUID? | Quick filter reference |
| `diff` | JSON? | `{ before: {...}, after: {...} }` for update operations |
| `meta` | JSON? | Extra context (remarks, IP address, etc.) |

### Log Helper Functions

```typescript
// All logs with filtering and pagination
getAllLogs(options)

// Scoped helpers
getLogsByForm(formId, options)
getLogsBySubmission(submissionId, options)
getLogsByUser(actorUserId, options)
getLogsByVerifier(actorVerifierId, options)
getLogsByEntity(entity, entityId?, options)
getLogsByDateRange(from, to, options)
getLogsByAction(action, options)
```

---

## Running Locally

```bash
cd backend

# Install dependencies
npm install

# Set up .env.local (see Environment Variables section above)

# Apply database schema
npx prisma migrate deploy

# Start development server on port 4000
npm run dev -- -p 3001
```

The API will be available at `http://localhost:3001/api/`.

---

## Running in Production

```bash
# Build the Next.js app
npm run build

# Start the production server
npm start
```

For Vercel deployment, set all environment variables in the Vercel project dashboard and run `npx prisma migrate deploy` as part of the build command or a pre-deploy script.