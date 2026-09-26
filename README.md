# Kompana

Kompana is a memory-card game with multiple card themes and multiplayer play. This repository contains application source and the images needed to build it. It does **not** contain a database, database backup, credentials, or user data.

## Run locally

Requires Node.js 20+ and a PostgreSQL database compatible with the existing schema.

1. Install dependencies: `npm ci`
2. Set `DATABASE_URL` and `SESSION_SECRET` as environment variables in your hosting platform or local environment. Do not commit their values. `DATABASE_URL` is the PostgreSQL connection string; `SESSION_SECRET` should be a strong private string.
3. Apply the existing schema with `npm run db:push` to **your own database** after reviewing the schema and any existing data.
4. Start development: `npm run dev`

For a production build, run `npm run build` and then `npm start`. Configure the host to pass the same environment variables at runtime. The app requires a working database; excluding database data from the repository does not make it database-free.

## Publishing on GitHub

The repository should contain source code, package manifests, and required image assets, but not `.env` files, cookies, database dumps, `node_modules`, or `dist`. If using the supplied GitHub export archive, extract it into a **new** repository before pushing; it deliberately contains no existing Git history. Review any new files you add before committing them.