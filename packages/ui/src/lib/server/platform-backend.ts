import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type {
  IntegrationStatus,
  InventoryItem,
  PlatformState,
  ServerUser,
  User,
} from "../store";
import { seedInventory } from "../store";

const DEFAULT_ADMIN_EMAIL = "admin@dajem.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@Dajem123";
const DEFAULT_ADMIN_PHONE = "+23480000000";
const SUPABASE_TABLE = process.env.SUPABASE_DAJEM_STATE_TABLE ?? "dajem_state";
const SUPABASE_ROW_KEY = process.env.SUPABASE_DAJEM_STATE_KEY ?? "platform";

function resolveRepoRoot() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "turbo.json"))) return cwd;

  const parentRoot = resolve(cwd, "..", "..");
  if (existsSync(join(parentRoot, "turbo.json"))) return parentRoot;

  return cwd;
}

function resolveDataFilePath() {
  return process.env.DAJEM_DATA_FILE ?? join(resolveRepoRoot(), ".dajem", "platform-state.json");
}

function nowIso() {
  return new Date().toISOString();
}

export function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createAdminUser(): ServerUser {
  const salt = randomBytes(16).toString("hex");

  return {
    id: "admin-1",
    name: "Dajem Admin",
    email: DEFAULT_ADMIN_EMAIL,
    phone: DEFAULT_ADMIN_PHONE,
    role: "admin",
    createdAt: nowIso(),
    passwordSalt: salt,
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD, salt),
  };
}

function createDefaultState(): PlatformState {
  return {
    users: [createAdminUser()],
    carts: {},
    orders: [],
    bids: [],
    surveys: [],
    inventory: seedInventory,
    paymentIntents: [],
    communicationLogs: [],
  };
}

function cloneState(state: PlatformState) {
  return JSON.parse(JSON.stringify(state)) as PlatformState;
}

function normalizeInventory(inventory: InventoryItem[]) {
  if (inventory.length > 0) return inventory;
  return seedInventory;
}

function sanitizeState(raw: unknown): PlatformState {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<PlatformState>;
  const users = Array.isArray(candidate.users) ? candidate.users : [];
  const adminExists = users.some((user) => user?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL);

  return {
    users: adminExists ? users as ServerUser[] : [createAdminUser(), ...(users as ServerUser[])],
    carts: candidate.carts && typeof candidate.carts === "object" ? candidate.carts : {},
    orders: Array.isArray(candidate.orders) ? candidate.orders : [],
    bids: Array.isArray(candidate.bids) ? candidate.bids : [],
    surveys: Array.isArray(candidate.surveys) ? candidate.surveys : [],
    inventory: normalizeInventory(Array.isArray(candidate.inventory) ? candidate.inventory : []),
    paymentIntents: Array.isArray(candidate.paymentIntents) ? candidate.paymentIntents : [],
    communicationLogs: Array.isArray(candidate.communicationLogs) ? candidate.communicationLogs : [],
  };
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) return null;

  return { url, secret };
}

function getSupabaseAdminClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createClient(config.url, config.secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function readFromFile() {
  const filePath = resolveDataFilePath();

  try {
    const raw = await readFile(filePath, "utf8");
    return sanitizeState(JSON.parse(raw));
  } catch {
    const seeded = createDefaultState();
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

async function writeToFile(state: PlatformState) {
  const filePath = resolveDataFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), "utf8");
}

async function readFromSupabase() {
  const client = getSupabaseAdminClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(SUPABASE_TABLE)
      .select("value")
      .eq("key", SUPABASE_ROW_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.value) {
      const seeded = createDefaultState();
      await writeToSupabase(seeded);
      return seeded;
    }

    return sanitizeState(data.value);
  } catch (error) {
    console.error("Supabase state read failed, falling back to filesystem.", error);
    return null;
  }
}

async function writeToSupabase(state: PlatformState) {
  const client = getSupabaseAdminClient();
  if (!client) return false;

  try {
    const { error } = await client.from(SUPABASE_TABLE).upsert({
      key: SUPABASE_ROW_KEY,
      value: state,
      updated_at: nowIso(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Supabase state write failed, falling back to filesystem.", error);
    return false;
  }
}

export async function readPlatformState() {
  const supabaseState = await readFromSupabase();
  if (supabaseState) return supabaseState;
  return readFromFile();
}

export async function writePlatformState(state: PlatformState) {
  const normalized = sanitizeState(state);
  const wroteToSupabase = await writeToSupabase(normalized);
  if (!wroteToSupabase) {
    await writeToFile(normalized);
  }
}

export async function updatePlatformState<T>(
  updater: (state: PlatformState) => Promise<T> | T,
) {
  const current = await readPlatformState();
  const next = cloneState(current);
  const result = await updater(next);
  await writePlatformState(next);
  return { result, state: next };
}

export function publicUser(user: ServerUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function getIntegrationStatus(): IntegrationStatus {
  return {
    backend: getSupabaseConfig() ? "supabase" : "filesystem",
    supabaseConfigured: Boolean(getSupabaseConfig()),
    flutterwaveConfigured: Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY),
    netlifyConfigured: Boolean(process.env.NETLIFY || process.env.CONTEXT || process.env.DEPLOY_PRIME_URL || process.env.URL),
  };
}

export function getDefaultAdminCredentials() {
  return {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };
}
