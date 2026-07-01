# St. Kisa Youth System

A Netlify-ready, interactive showcase for St. Kisa Youth Self-Help Group.

## Showcase capabilities

- Manual login experiences for members and all official roles
- Role-based navigation and record visibility
- Ordered welfare, refund, and investment approval workflows with audit history
- Role-specific Approval Inbox with pending, approved, and rejected queues
- Persistent browser data using versioned local storage
- Member onboarding and searchable register
- Contribution posting with table-banking validation
- Personal member statements and PDF downloads
- Welfare and refund request workflows
- Investment register with policy limit checks
- PDF/JPEG/PNG document upload and download
- Excel member, contribution, and request registers
- PDF Treasurer, trial-balance, and financial-position reports
- Responsive desktop and mobile layouts

## Showcase access

Login fields start empty and no account emails or passwords are displayed in
the application. Showcase credentials are supplied privately to the project
owner. Browser-only authentication must be replaced by server-side
authentication before handling real member data.

## Run locally

```powershell
pnpm install
pnpm dev
```

Open http://127.0.0.1:5175.

## Deploy to Netlify

The included `netlify.toml` configures the build and single-page-app redirects.

1. Push the project to GitHub.
2. Import the repository in Netlify.
3. Netlify will run `pnpm --filter @st-kisa/web build`.
4. The publish directory is `apps/web/dist`.

No environment variables or database are required for the showcase.

## Important data limitation

Showcase records are stored only in the visitor's browser. They persist across
refreshes on that browser but are not shared between users or devices. Uploaded
documents are limited to 2 MB because they are also stored in the browser.

Use **Reset showcase data** in the sidebar to restore the original dataset.

## Production phase

Before using real member information:

1. Replace demo authentication with server-side accounts, password hashes, MFA,
   secure HTTP-only sessions, and account recovery.
2. Add PostgreSQL with reviewed migrations and encrypted backups.
3. Move uploads to private object storage with malware scanning and signed URLs.
4. Enforce API-side authorization and immutable audit logs.
5. Ratify the provisional decisions in
   [`docs/POLICY_DECISIONS.md`](docs/POLICY_DECISIONS.md).
6. Complete a privacy, security, and financial-controls review.
