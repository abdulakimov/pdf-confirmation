# Deploy — confirmation.qariya.uz

**Since 2026-10-26:** push to `main` → GitHub webhook → Coolify (https://coolify.qariya.uz, project
"pdf-confirmation") builds `Dockerfile.prod` on the box from `docker-compose.coolify.yml`:
`migrate` (`prisma db push` + `scripts/bootstrap-admin.mjs`) runs first, then `app`.

- Postgres stays the `confirmation-db-1` container (volume `confirmation_postgres_data`, started from
  `docker-compose.prod.yml` in `/root/confirmation-qariya`). Coolify joins its network `confirmation_default`
  and the uploads volume `confirmation_uploads` as external resources.
- Env values live in Coolify → Environment Variables. `/root/confirmation-qariya/.env.production` no longer
  affects the app.
- nginx `confirmation.qariya.uz` → `127.0.0.1:8081` (Coolify Traefik), not 3011.
- Do not run `docker compose -f docker-compose.prod.yml up` on the box for `app`: it would start a second copy.
- Rollback: `git revert` + push. Break-glass: stop the Coolify app, `docker compose -f docker-compose.prod.yml
  start app` in `/root/confirmation-qariya`, and point the vhost back to `127.0.0.1:3011`.
- `docker-compose.prod.yml` / `Dockerfile.prod` are the previous box-only production files, now in git.
- Database changes still follow `docs/OPS_SECURITY.md` (no destructive schema changes without approval).
- `migrate` runs `scripts/bootstrap-admin.mjs` on EVERY deploy: it resets the admin password to
  `BOOTSTRAP_ADMIN_PASSWORD`. To change the admin password, change that variable in Coolify and redeploy
  (a password changed in the UI is overwritten by the next deploy). The script no longer prints the password.
- Coolify deploys branch `main`. The GitHub default branch is `codex/publish-code`; do not deploy from it.
