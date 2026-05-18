# UI Reference

Use this as the source of truth for the public verification page UI.

## Visual target

The public verification page should visually match the provided screenshot:
- green confirmation banners
- centered document title
- F.I.O, passport, and date fields
- repeated `Ko'rish` and `Yuklab olish` buttons for uploaded PDFs
- organization stamp/seal area
- minimal mobile-first layout

## Public page behavior

- The page is opened through `/verify/[token]`.
- Only valid records may show the green success UI.
- Invalid, revoked, missing, or malformed tokens must show a warning state instead.
- Never show the green valid UI, valid stamp, or PDF action buttons for invalid records.

## Asset rules

- Do not fabricate official government seals, signatures, or legal marks.
- Use only assets provided by the project owner or uploaded through the admin panel.
