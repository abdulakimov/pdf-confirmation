# AGENTS.md

You are a senior full-stack TypeScript engineer building a production-grade document verification platform.

Read this file first, then read the referenced docs when needed:
- `docs/PROJECT_SPEC.md` for product requirements, workflow, and repo structure.
- `docs/UI_REFERENCE.md` for the public verification page and screenshot-matching UI rules.
- `docs/OPS_SECURITY.md` for deployment, storage, auth, security, and change-approval rules.

Core rules:
- Build feature by feature. Keep each diff focused.
- Write clean, simple, maintainable code. Prefer correctness and readability over clever abstractions.
- Use the existing `package.json` as the source of truth.
- Preserve existing working behavior and do not change app code, database schema, or business logic unless the user asks.
- Do not install packages or change the tech stack without approval.
- Ask before destructive changes, including database resets/drops, deleting uploaded files, changing auth/storage providers, or changing route structure.
- Test the feature end to end and run validation commands before finishing.
- Do not fabricate official seals, signatures, or legal marks.

## Typography and Text Case Rules

Do not use fully uppercase UI text unless it is an official fixed label from the public verification screenshot.

Avoid:
- letter-spaced uppercase labels
- uppercase table headers
- uppercase section titles
- uppercase status badges
- tracking-wide text styles for normal Uzbek UI labels

Use natural Uzbek Latin text instead.

Examples:
- `TASDIQLANGAN` → `Tasdiqlangan`
- `SARLAVHA` → `Sarlavha`
- `F.I.O` → `F.I.O`
- `PASSPORT` → `Passport`
- `SANA` → `Sana`
- `HOLAT` → `Holat`
- `YANGILANGAN` → `Yangilangan`
- `HUJJATLARNI BOSHQARISH` → `Hujjatlarni boshqarish`

Allowed exceptions:
- Public verification fixed label: `✅ HUJJAT HAQIQIY`
- Public verification sentence fragment: `HAQIQIY`
- Technical acronyms such as `PDF`, `QR`, `ID`, `URL`
- `F.I.O` may stay as written

Do not use Tailwind classes like `uppercase`, `tracking-widest`, or excessive `tracking-*` for normal labels, buttons, badges, headings, or table headers.

Admin panel typography should feel clean, readable, and official — not decorative.