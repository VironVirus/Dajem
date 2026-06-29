import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type {
  IntegrationStatus,
  InventoryItem,
  PlatformState,
  PropertyListing,
  ServerUser,
  SurveyService,
  User,
} from "../store";
import { seedInventory, seedPropertyListings, seedSurveyServices } from "../store";

const DEV_ADMIN_EMAIL = "admin@dajem.local";
const DEV_ADMIN_PASSWORD = "ChangeMe123!";
const DEV_ADMIN_PHONE = "+23480000000";
const SUPABASE_TABLE = process.env.SUPABASE_DAJEM_STATE_TABLE ?? "dajem_state";
const SUPABASE_ROW_KEY = process.env.SUPABASE_DAJEM_STATE_KEY ?? "platform";
let supabaseRuntimeState: "unknown" | "healthy" | "degraded" = "unknown";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.NETLIFY);
}

function allowFileBackend() {
  return !isProductionRuntime() || process.env.DAJEM_ALLOW_FILE_FALLBACK === "true";
}

function allowTransientNetlifyFallback() {
  return Boolean(process.env.NETLIFY);
}

function resolveRepoRoot() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "turbo.json"))) return cwd;

  const parentRoot = resolve(cwd, "..", "..");
  if (existsSync(join(parentRoot, "turbo.json"))) return parentRoot;

  return cwd;
}

function resolveDataFilePath() {
  if (process.env.DAJEM_DATA_FILE) {
    return process.env.DAJEM_DATA_FILE;
  }

  if (process.env.NETLIFY && allowFileBackend()) {
    return join("/tmp", ".dajem", "platform-state.json");
  }

  return join(resolveRepoRoot(), ".dajem", "platform-state.json");
}

function nowIso() {
  return new Date().toISOString();
}

function markSupabaseHealthy() {
  supabaseRuntimeState = "healthy";
}

function markSupabaseDegraded() {
  if (getSupabaseConfig()) {
    supabaseRuntimeState = "degraded";
  }
}

export function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function getConfiguredAdminSeed() {
  const email = process.env.DAJEM_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DAJEM_ADMIN_PASSWORD?.trim();
  const phone = process.env.DAJEM_ADMIN_PHONE?.trim() || DEV_ADMIN_PHONE;

  if (email && password) {
    return { email, password, phone };
  }

  if (isProductionRuntime()) {
    return null;
  }

  return {
    email: DEV_ADMIN_EMAIL,
    password: DEV_ADMIN_PASSWORD,
    phone: DEV_ADMIN_PHONE,
  };
}

function createAdminUser(): ServerUser | null {
  const seed = getConfiguredAdminSeed();
  if (!seed) return null;

  const salt = randomBytes(16).toString("hex");

  return {
    id: "admin-1",
    name: "Dajem Admin",
    email: seed.email,
    phone: seed.phone,
    role: "admin",
    createdAt: nowIso(),
    passwordSalt: salt,
    passwordHash: hashPassword(seed.password, salt),
  };
}

function createDefaultState(): PlatformState {
  const admin = createAdminUser();

  return {
    users: admin ? [admin] : [],
    carts: {},
    orders: [],
    bids: [],
    surveys: [],
    inventory: seedInventory,
    propertyListings: seedPropertyListings,
    surveyServices: seedSurveyServices,
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

function migrateInventory(inventory: InventoryItem[]) {
  const legacySeedIds = new Set(["doc-01", "doc-02", "feed-01", "feed-02", "equip-01", "equip-02", "proc-01"]);
  const looksLikeLegacySeed = inventory.length > 0 && inventory.every((item) => legacySeedIds.has(item.productId));

  if (looksLikeLegacySeed) {
    return seedInventory;
  }

  return normalizeInventory(inventory).map((item) => ({
    ...item,
    imageUrl: item.imageUrl || seedInventory[0]?.imageUrl,
  }));
}

function normalizePropertyListings(listings: PropertyListing[]) {
  if (listings.length > 0) return listings;
  return seedPropertyListings;
}

function normalizeSurveyServices(services: SurveyService[]) {
  if (services.length > 0) return services;
  return seedSurveyServices;
}

function migratePendingStatus<T extends { status?: string }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    status: item.status === "Pending" ? "Pending Approval" : item.status,
  }));
}

function sanitizeState(raw: unknown): PlatformState {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<PlatformState>;
  const users = Array.isArray(candidate.users) ? candidate.users : [];
  const configuredAdmin = createAdminUser();
  const adminEmail = configuredAdmin?.email.toLowerCase();
  const adminExists = adminEmail
    ? users.some((user) => user?.email?.toLowerCase() === adminEmail)
    : true;

  return {
    users: adminExists || !configuredAdmin ? users as ServerUser[] : [configuredAdmin, ...(users as ServerUser[])],
    carts: candidate.carts && typeof candidate.carts === "object" ? candidate.carts : {},
    orders: Array.isArray(candidate.orders) ? candidate.orders : [],
    bids: Array.isArray(candidate.bids) ? migratePendingStatus(candidate.bids) : [],
    surveys: Array.isArray(candidate.surveys) ? migratePendingStatus(candidate.surveys) : [],
    inventory: migrateInventory(Array.isArray(candidate.inventory) ? candidate.inventory : []),
    propertyListings: normalizePropertyListings(Array.isArray(candidate.propertyListings) ? candidate.propertyListings : []),
    surveyServices: normalizeSurveyServices(Array.isArray(candidate.surveyServices) ? candidate.surveyServices : []),
    paymentIntents: Array.isArray(candidate.paymentIntents) ? candidate.paymentIntents : [],
    communicationLogs: Array.isArray(candidate.communicationLogs) ? candidate.communicationLogs : [],
  };
}

function getSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? process.env.SUPABASE_SERVICE_KEY;

  if (!rawUrl || !secret) return null;

  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.pathname.startsWith("/rest/v1")) {
      parsed.pathname = "";
      parsed.search = "";
      parsed.hash = "";
    }

    return { url: parsed.origin, secret };
  } catch {
    return null;
  }
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
      markSupabaseHealthy();
      return seeded;
    }

    markSupabaseHealthy();
    return sanitizeState(data.value);
  } catch (error) {
    markSupabaseDegraded();
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
    markSupabaseHealthy();
    return true;
  } catch (error) {
    markSupabaseDegraded();
    console.error("Supabase state write failed, falling back to filesystem.", error);
    return false;
  }
}

export async function readPlatformState() {
  const supabaseIsConfigured = Boolean(getSupabaseConfig());
  const supabaseState = await readFromSupabase();
  if (supabaseState) return supabaseState;

  if (allowFileBackend() || allowTransientNetlifyFallback()) {
    return readFromFile();
  }

  if (supabaseIsConfigured) {
    return createDefaultState();
  }

  return createDefaultState();
}

export async function writePlatformState(state: PlatformState) {
  const normalized = sanitizeState(state);
  const wroteToSupabase = await writeToSupabase(normalized);
  if (wroteToSupabase) return;

  if (allowFileBackend() || allowTransientNetlifyFallback()) {
    await writeToFile(normalized);
    return;
  }

  throw new Error("Supabase is required for persistent production actions.");
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
    officialTitle: user.officialTitle,
    identificationType: user.identificationType,
    identificationNumber: user.identificationNumber,
    identificationImageUrl: user.identificationImageUrl,
  };
}

export function getIntegrationStatus(): IntegrationStatus {
  const supabaseConfigured = Boolean(getSupabaseConfig());
  const backend = supabaseConfigured && supabaseRuntimeState !== "degraded"
    ? "supabase"
    : allowFileBackend() || allowTransientNetlifyFallback()
      ? "filesystem"
      : supabaseConfigured
        ? "supabase"
        : "unconfigured";

  return {
    backend,
    supabaseConfigured,
    flutterwaveConfigured: Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY),
    netlifyConfigured: Boolean(process.env.NETLIFY || process.env.CONTEXT || process.env.DEPLOY_PRIME_URL || process.env.URL),
  };
}
