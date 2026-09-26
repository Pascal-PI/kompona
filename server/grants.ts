import { pool } from "./db";

const GRANT_NAME = "grant_existing_users_premium_v1_20260502";
const PLATINUM_GRANT_NAME = "grant_existing_users_platinum_v1_20260502";
const FROMXIMUS_THEMES_GRANT_NAME = "grant_fromximus_all_themes_v1_20260922";
const ALL_THEMES = ["saints", "animals", "barbie", "puppy", "santa", "space", "minecraft"];
const EXPIRES_AT = "2125-01-01T00:00:00Z";

async function ensureGrantsTable(client: Awaited<ReturnType<typeof pool.connect>>) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS system_grants (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW(),
      rows_affected INTEGER
    )
  `);
}

export async function runGrantFromximusAllThemes(): Promise<void> {
  let client: Awaited<ReturnType<typeof pool.connect>> | null = null;
  try {
    client = await pool.connect();
    await ensureGrantsTable(client);
    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO system_grants (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING name`,
      [FROMXIMUS_THEMES_GRANT_NAME],
    );

    if (insertResult.rowCount === 0) {
      await client.query("COMMIT");
      console.log(`[grants] ${FROMXIMUS_THEMES_GRANT_NAME} already applied — skipping`);
      return;
    }

    const updateResult = await client.query(
      `UPDATE users
       SET owned_themes = $1
       WHERE lower(username) = lower($2)`,
      [ALL_THEMES, "Fromximus"],
    );

    await client.query(
      `UPDATE system_grants SET rows_affected = $1 WHERE name = $2`,
      [updateResult.rowCount, FROMXIMUS_THEMES_GRANT_NAME],
    );

    await client.query("COMMIT");
    console.log(
      `[grants] ${FROMXIMUS_THEMES_GRANT_NAME} APPLIED — unlocked all themes for ${updateResult.rowCount} user`,
    );
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }
    console.error(`[grants] ${FROMXIMUS_THEMES_GRANT_NAME} FAILED — server will continue starting:`, err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch {}
    }
  }
}

export async function runGrantExistingUsersPlatinum(): Promise<void> {
  let client: Awaited<ReturnType<typeof pool.connect>> | null = null;
  try {
    client = await pool.connect();
    await ensureGrantsTable(client);

    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO system_grants (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING name`,
      [PLATINUM_GRANT_NAME],
    );

    if (insertResult.rowCount === 0) {
      await client.query("COMMIT");
      console.log(`[grants] ${PLATINUM_GRANT_NAME} already applied — skipping`);
      return;
    }

    const updateResult = await client.query(
      `UPDATE users
       SET membership_tier = 'platinum',
           membership_expires_at = $1,
           owned_themes = $2`,
      [EXPIRES_AT, ALL_THEMES],
    );

    await client.query(
      `UPDATE system_grants SET rows_affected = $1 WHERE name = $2`,
      [updateResult.rowCount, PLATINUM_GRANT_NAME],
    );

    await client.query("COMMIT");
    console.log(
      `[grants] ${PLATINUM_GRANT_NAME} APPLIED — upgraded ${updateResult.rowCount} existing users to platinum with all themes`,
    );
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }
    console.error(`[grants] ${PLATINUM_GRANT_NAME} FAILED — server will continue starting:`, err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch {}
    }
  }
}

export async function runGrantExistingUsersPremium(): Promise<void> {
  let client: Awaited<ReturnType<typeof pool.connect>> | null = null;
  try {
    client = await pool.connect();
    await ensureGrantsTable(client);

    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO system_grants (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING name`,
      [GRANT_NAME],
    );

    if (insertResult.rowCount === 0) {
      await client.query("COMMIT");
      console.log(`[grants] ${GRANT_NAME} already applied — skipping`);
      return;
    }

    const updateResult = await client.query(
      `UPDATE users
       SET membership_tier = 'premium',
           membership_expires_at = $1,
           owned_themes = $2
       WHERE membership_tier IS NULL
          OR membership_tier IN ('free', 'premium')`,
      [EXPIRES_AT, ALL_THEMES],
    );

    await client.query(
      `UPDATE system_grants SET rows_affected = $1 WHERE name = $2`,
      [updateResult.rowCount, GRANT_NAME],
    );

    await client.query("COMMIT");
    console.log(
      `[grants] ${GRANT_NAME} APPLIED — upgraded ${updateResult.rowCount} existing users to premium with all themes`,
    );
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }
    console.error(`[grants] ${GRANT_NAME} FAILED — server will continue starting:`, err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch {}
    }
  }
}
