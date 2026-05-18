# Project Spec

## Product

Build a web platform where admins can upload verified PDF documents, enter owner metadata, and generate a public verification link plus QR code.

## Main surfaces

### Admin panel
- Authenticate admins.
- Create, edit, revoke, and preview document verification records.
- Upload one or more PDF files.
- Enter visible metadata.
- Generate a public verify URL.
- Generate and download a QR code.

### Public verification page
- Opened through `/verify/[token]`.
- Shows whether the document is valid.
- Displays metadata exactly as defined by the UI reference.
- Allows viewing and downloading linked PDFs only when the record is valid.
- Never exposes admin functionality.

## Product rules

- The app verifies only records that exist in this system.
- Never show `HUJJAT HAQIQIY` for missing, draft, revoked, expired, deleted, or malformed/guessed tokens.
- Invalid, revoked, or missing records must show a clear warning page.
- Do not show the green valid UI, valid stamp, or PDF action buttons for invalid records.

## Development flow

- Build feature by feature.
- Read the relevant docs before touching a feature.
- Identify the minimal files needed for the change.
- Keep the implementation simple and localized.
- Do not rewrite unrelated code.
- Preserve existing behavior.
- Test the new feature end to end.
- Run validation commands before finishing.

## Recommended stack

Use the existing `package.json` as the source of truth.

If the project is created from scratch, prefer:
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

## Suggested structure

Use this structure unless the repo already has a clear one:

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
```

