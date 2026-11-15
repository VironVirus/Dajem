/*
 * One-time private catalogue seed. This intentionally reads the local, ignored
 * source-derived JSON and never writes plot data into Git or browser assets.
 * Run only with the production server environment and an explicit --confirm.
 */
const { readFileSync } = require("node:fs");
const { createClient } = require("@supabase/supabase-js");
const mysql = require("mysql2/promise");

if (!process.argv.includes("--confirm")) {
  throw new Error("Refusing to change shared data. Re-run with --confirm after reviewing the source workbook.");
}
const catalogue = JSON.parse(readFileSync("packages/ui/src/lib/lifting-estates.json", "utf8"));
const clic = catalogue.find((estate) => estate.id === "clic-estate");
if (!clic || !Array.isArray(clic.plots) || clic.plots.length !== 43) {
  throw new Error("Expected the reviewed 43-plot CLIC source catalogue. Stop and re-check the workbook before seeding.");
}

const table = process.env.SUPABASE_DAJEM_STATE_TABLE ?? "dajem_state";
const rowKey = process.env.SUPABASE_DAJEM_STATE_KEY ?? "platform";

function clicEstate() {
  return {
    id: "clic-estate",
    name: "CLIC ESTATE",
    approved: true,
    plots: clic.plots.map((plot) => ({ number: plot.number, areaSqm: plot.areaSqm, layout: "CLIC ESTATE" })),
  };
}

async function seedMySql() {
  const { DAJEM_MYSQL_DATABASE: database, DAJEM_MYSQL_USER: user, DAJEM_MYSQL_PASSWORD: password } = process.env;
  if (!database || !user || !password) throw new Error("MySQL database settings are required in the environment.");
  const connection = await mysql.createConnection({ host: process.env.DAJEM_MYSQL_HOST || "127.0.0.1", port: Number(process.env.DAJEM_MYSQL_PORT || 3306), database, user, password });
  try {
    const [rows] = await connection.execute("SELECT value, revision FROM dajem_platform_state WHERE state_key = ?", [rowKey]);
    if (!rows.length) throw new Error("MySQL platform state was not found.");
    const state = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
    state.liftingCatalogue = [clicEstate()];
    const [result] = await connection.execute("UPDATE dajem_platform_state SET value = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP(6) WHERE state_key = ? AND revision = ?", [JSON.stringify(state), rowKey, rows[0].revision]);
    if (result.affectedRows !== 1) throw new Error("Shared state changed while seeding. Nothing was overwritten; retry after reviewing current data.");
  } finally {
    await connection.end();
  }
}

async function seedSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are required in the environment.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.from(table).select("value, updated_at").eq("key", rowKey).single();
  if (error || !data?.value || typeof data.value !== "object") throw new Error(error?.message ?? "Shared platform state was not found.");

  const state = data.value;
  state.liftingCatalogue = [clicEstate()];
  const { data: saved, error: saveError } = await client.from(table)
    .update({ value: state, updated_at: new Date().toISOString() })
    .eq("key", rowKey)
    .eq("updated_at", data.updated_at)
    .select("updated_at");
  if (saveError) throw new Error(saveError.message);
  if (!saved?.length) throw new Error("Shared state changed while seeding. Nothing was overwritten; retry after reviewing current data.");
}

async function main() {
  if (process.env.DAJEM_DATA_BACKEND === "mysql") await seedMySql();
  else await seedSupabase();
  console.log("Private CLIC catalogue seeded: 43 residential plots. Other estates remain unavailable.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
