# Ops and Security

## Change control

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

Never run destructive database commands such as reset or drop without explicit approval.

## Storage and deployment

- Use server-side file upload handling.
- Use object storage for production PDFs.
- Keep QR generation server-side.
- Keep admin-only functionality off the public verification surface.

## Implementation guardrails

- Use the existing `package.json` as the source of truth.
- Prefer predictable architecture and simple server-side flows.
- Do not introduce new major libraries unless there is a strong reason.
- Keep changes focused and reversible.
