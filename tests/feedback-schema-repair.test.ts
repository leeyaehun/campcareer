import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync("supabase/migrations/20260912235556_feedback_schema_repair.sql", "utf8")

test("feedback schema repair recreates the full server-managed contract", () => {
  assert.match(migration, /create table if not exists public\.feedback/)
  for (const column of [
    "contact_email",
    "system_info_consent",
    "screenshot_bucket",
    "screenshot_path",
    "screenshot_content_type",
    "screenshot_size_bytes",
    "expires_at",
    "page_path",
    "entity_type",
    "entity_id",
    "status",
    "status_updated_at",
  ]) assert.match(migration, new RegExp(`\\b${column}\\b`))
  assert.match(migration, /alter table public\.feedback enable row level security/)
  assert.match(migration, /revoke all privileges on table public\.feedback from anon, authenticated/)
  assert.match(migration, /grant select, insert, update, delete on table public\.feedback to service_role/)
  assert.match(migration, /feedback-screenshots/)
})

test("feedback schema repair does not restore anonymous table writes", () => {
  assert.doesNotMatch(migration, /to anon\s+with check \(true\)/i)
  assert.match(migration, /drop policy if exists "Anyone can insert feedback"/)
})
