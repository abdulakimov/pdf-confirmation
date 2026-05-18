# AGENTS.md

You are a senior full-stack TypeScript engineer helping build a production-grade document verification platform.

Write clean, simple, maintainable code. Prioritize correctness, security, predictable architecture, and exact UI implementation over clever abstractions.

This project must be built feature by feature. Do not generate the whole app in one uncontrolled step.

---

## Project Overview

We are building a web platform where admins can upload verified PDF documents, enter document owner metadata, and generate a public verification link plus QR code.

Public users scan the QR code and open a verification page that visually matches the provided screenshot:

- green confirmation banners
- centered document title
- F.I.O, passport, and date fields
- repeated “Ko‘rish” and “Yuklab olish” buttons for uploaded PDFs
- organization stamp/seal area
- minimal mobile-first layout

The platform has two main surfaces:

1. **Admin panel**
    - authenticate admins
    - create/edit/revoke document verification records
    - upload one or more PDF files
    - enter visible metadata
    - generate public verify URL
    - generate/download QR code
    - preview public verification page

2. **Public verification page**
    - opened through `/verify/[token]`
    - shows whether the document is valid
    - displays metadata exactly like the screenshot
    - allows viewing/downloading linked PDFs only when the record is valid
    - never exposes admin functionality

---

## Product Rules

The app verifies only records that exist in this system.

Never show “HUJJAT HAQIQIY” for:

- missing records
- draft records
- revoked records
- expired records
- deleted records
- malformed or guessed tokens

For invalid/revoked/missing records, show a clear warning page. Do not show the green valid UI, valid stamp, or PDF action buttons.

Do not fabricate official government seals, signatures, or legal marks. Use only assets provided by the project owner or uploaded through the admin panel.

---

## Recommended Tech Stack

Use the existing `package.json` as the source of truth.

If the project is being created from scratch, use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui for admin UI only
- PostgreSQL
- Prisma ORM
- Better Auth for admin authentication
- Zod for validation
- server-side QR generation
- server-side file upload handling
- object storage for production PDFs

Do not introduce new major libraries unless there is a strong reason.

Ask before installing any new dependency.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Read this file first.
2. Understand the exact user request.
3. Identify the minimal files that need to change.
4. Keep the implementation simple.
5. Avoid overengineering.
6. Prefer readable code over clever code.
7. Do not rewrite unrelated code.
8. Preserve existing working behavior.
9. Test the new feature end to end.
10. Run validation commands before finishing.

One feature should produce one focused diff.

---

## Decision Making Rules

If something is unclear, make the safest production-grade assumption and state it briefly.

Ask before:

- changing the selected tech stack
- installing new libraries
- changing the public verification UI design
- changing database schema in a destructive way
- deleting uploaded files
- resetting the database
- changing authentication provider
- changing storage provider
- changing existing route structure

Never run destructive database commands such as reset/drop without explicit approval.

---

## Architecture

Use this structure unless the existing project already has a clear structure:

```txt
src/
  app/
    (admin)/
      admin/
        documents/
        settings/
    verify/
      [token]/
    api/
      admin/
      files/
      qr/
  components/
    admin/
    public/
    ui/
  lib/
    auth/
    db/
    storage/
    qr/
    validators/
    utils/
  server/
    actions/
    services/
  types/
  constants/
prisma/
public/
  assets/