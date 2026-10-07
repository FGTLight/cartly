// Concatenates the migrations and the seed into supabase/setup.sql, so the
// whole backend can be created with a single paste in the SQL Editor.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const migrations = readdirSync('supabase/migrations')
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => `supabase/migrations/${f}`)
const files = [...migrations, 'supabase/seed.sql']

const header = `-- Cartly · complete database setup (GENERATED, do not edit).
-- Source: supabase/migrations/*.sql + supabase/seed.sql
-- Regenerate with: npm run db:setup
--
-- Paste into Supabase → SQL Editor → New query, then Run.
-- Run it once, on a new project.
`

const rule = `-- ${'='.repeat(70)}`
const body = files
  .map((f) => `\n${rule}\n-- ${f}\n${rule}\n\n${readFileSync(f, 'utf8').trim()}\n`)
  .join('')

writeFileSync('supabase/setup.sql', header + body)
console.log(`supabase/setup.sql written from ${files.length} files`)
