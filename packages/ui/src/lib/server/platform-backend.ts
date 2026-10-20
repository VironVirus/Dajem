import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createPool, type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type {
  IntegrationStatus,
  InventoryItem,
  FarmDeliverySettings,
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

function allowFileBackend() {
  return process.env.NODE_ENV !== "production";
}

function resolveDataFilePath() {
  return join(process.cwd(), ".dajem", "platform-state.json");
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

  if (process.env.NODE_ENV === "production") {
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
    emailVerified: true,
    passwordSalt: salt,
    passwordHash: hashPassword(seed.password, salt),
  };
}

function defaultFarmDeliverySettings(): FarmDeliverySettings {
  const supportNumber = (process.env.DAJEM_SUPPORT_WHATSAPP ?? getConfiguredAdminSeed()?.phone ?? "").replace(/\D/g, "");
  return {
    stateRates: [],
    restOfCountryFee: 0,
    whatsappNumber: supportNumber,
  };
}

function normalizeFarmDeliverySettings(value: unknown): FarmDeliverySettings {
  const defaults = defaultFarmDeliverySettings();
  if (!value || typeof value !== "object") return defaults;
  const candidate = value as Partial<FarmDeliverySettings>;
  const stateRates = Array.isArray(candidate.stateRates)
    ? candidate.stateRates
      .map((rate) => ({ state: String(rate?.state ?? "").trim().slice(0, 100), fee: Number(rate?.fee) }))
      .filter((rate) => rate.state && Number.isFinite(rate.fee) && rate.fee >= 0)
      .slice(0, 37)
    : defaults.stateRates;
  const restOfCountryFee = Number(candidate.restOfCountryFee);
  return {
    stateRates: stateRates.length > 0 ? stateRates : defaults.stateRates,
    restOfCountryFee: Number.isFinite(restOfCountryFee) && restOfCountryFee >= 0 ? restOfCountryFee : defaults.restOfCountryFee,
    whatsappNumber: String(candidate.whatsappNumber ?? defaults.whatsappNumber).replace(/\D/g, "").slice(0, 15),
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
    farmDeliverySettings: defaultFarmDeliverySettings(),
    supportTickets: [],
    auditLogs: [],
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

function deriveHomesListingGroup(listing: PropertyListing): NonNullable<PropertyListing["listingGroup"]> {
  if (listing.listingGroup) return listing.listingGroup;
  if (listing.category === "land") return listing.type === "sale" ? "land-sale" : "land-lease";
  if (listing.type === "short-let" || listing.category === "short-let" || listing.category === "suite") return "short-let";
  return listing.type === "sale" ? "house-sale" : "house-rent";
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

function removeLegacyIdentityFields(user: ServerUser) {
  const {
    officialTitle: _officialTitle,
    identificationType: _identificationType,
    identificationNumber: _identificationNumber,
    identificationImageUrl: _identificationImageUrl,
    ...safeUser
  } = user as ServerUser & Record<string, unknown>;

  return safeUser as ServerUser;
}

function sanitizeState(raw: unknown): PlatformState {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<PlatformState>;
  const users = Array.isArray(candidate.users)
    ? candidate.users.filter((user): user is ServerUser => Boolean(user && typeof user === "object"))
      .map(removeLegacyIdentityFields)
      // Existing accounts predate verification, so retain their established access.
      .map((user) => ({
        ...user,
        emailVerified: typeof user.emailVerified === "boolean" ? user.emailVerified : true,
        mfaEnabled: typeof user.mfaEnabled === "boolean" ? user.mfaEnabled : false,
      }))
    : [];
  const configuredAdmin = createAdminUser();
  const adminEmail = configuredAdmin?.email.toLowerCase();
  const adminExists = adminEmail
    ? users.some((user) => user?.email?.toLowerCase() === adminEmail)
    : true;

  return {
    users: adminExists || !configuredAdmin ? users : [configuredAdmin, ...users],
    carts: candidate.carts && typeof candidate.carts === "object" ? candidate.carts : {},
    orders: Array.isArray(candidate.orders) ? candidate.orders : [],
    bids: Array.isArray(candidate.bids) ? migratePendingStatus(candidate.bids) : [],
    surveys: Array.isArray(candidate.surveys) ? migratePendingStatus(candidate.surveys) : [],
    inventory: migrateInventory(Array.isArray(candidate.inventory) ? candidate.inventory : []),
    propertyListings: normalizePropertyListings(Array.isArray(candidate.propertyListings) ? candidate.propertyListings : [])
      .map((listing) => ({ ...listing, listingGroup: deriveHomesListingGroup(listing) })),
    surveyServices: normalizeSurveyServices(Array.isArray(candidate.surveyServices) ? candidate.surveyServices : []),
    paymentIntents: Array.isArray(candidate.paymentIntents) ? candidate.paymentIntents : [],
    communicationLogs: Array.isArray(candidate.communicationLogs) ? candidate.communicationLogs : [],
    farmDeliverySettings: normalizeFarmDeliverySettings(candidate.farmDeliverySettings),
    supportTickets: Array.isArray(candidate.supportTickets) ? candidate.supportTickets : [],
    auditLogs: Array.isArray(candidate.auditLogs) ? candidate.auditLogs.slice(0, 1000) : [],
    brandLogoUrl: typeof candidate.brandLogoUrl === "string" ? candidate.brandLogoUrl.slice(0, 2000) : undefined,
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

function getSupabaseAuthConfig() {
  const config = getSupabaseConfig();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?? process.env.SUPABASE_AUTH_PUBLISHABLE_KEY;
  if (!config || !publishableKey?.trim()) return null;
  return { url: config.url, publishableKey: publishableKey.trim() };
}

export function getSupabaseAdminClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createClient(config.url, config.secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAuthClient() {
  const config = getSupabaseAuthConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  });
}

export function isSupabaseAuthConfigured() {
  return Boolean(getSupabaseAuthConfig());
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "dajem-documents";
}

export function getSupabaseMediaBucket() {
  return process.env.SUPABASE_MEDIA_BUCKET?.trim() || "dajem-media";
}

async function readFromFile() {
  const filePath = resolveDataFilePath();

  try {
    const raw = await readFile(/* turbopackIgnore: true */ filePath, "utf8");
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

type SupabaseState = {
  state: PlatformState;
  updatedAt: string;
};

type StateForUpdate = {
  state: PlatformState;
  source: "supabase" | "mysql" | "file" | "memory";
  updatedAt?: string;
  revision?: number;
};

let mysqlPool: Pool | undefined;

function useMySql() {
  return process.env.DAJEM_DATA_BACKEND === "mysql";
}

function getMySqlPool(): Pool {
  if (mysqlPool) return mysqlPool;
  const { DAJEM_MYSQL_DATABASE: database, DAJEM_MYSQL_USER: user, DAJEM_MYSQL_PASSWORD: password } = process.env;
  if (!database || !user || !password) throw new Error("MySQL database settings are incomplete.");
  mysqlPool = createPool({
    host: process.env.DAJEM_MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.DAJEM_MYSQL_PORT || 3306),
    database, user, password,
    connectionLimit: 3,
    supportBigNumbers: true,
  });
  return mysqlPool;
}

async function readFromMySql(): Promise<StateForUpdate> {
  const [rows] = await getMySqlPool().execute<RowDataPacket[]>(
    "SELECT value, revision FROM dajem_platform_state WHERE state_key = ?", [SUPABASE_ROW_KEY],
  );
  if (rows.length !== 1) throw new Error("MySQL data has not been migrated; the application cannot start with an empty database.");
  const value = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
  if (!value || typeof value !== "object" || !Array.isArray(value.users)) throw new Error("MySQL platform data is invalid.");
  const revision = Number(rows[0].revision);
  if (!Number.isSafeInteger(revision) || revision < 0) throw new Error("MySQL platform revision is invalid.");
  return { state: sanitizeState(value), source: "mysql", revision };
}

async function writeToMySql(state: PlatformState, revision: number) {
  const [result] = await getMySqlPool().execute<ResultSetHeader>(
    "UPDATE dajem_platform_state SET value = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP(6) WHERE state_key = ? AND revision = ?",
    [JSON.stringify(state), SUPABASE_ROW_KEY, revision],
  );
  return result.affectedRows === 1;
}

async function readFromSupabase(): Promise<SupabaseState | null> {
  const client = getSupabaseAdminClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(SUPABASE_TABLE)
      .select("value, updated_at")
      .eq("key", SUPABASE_ROW_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data?.value) {
      const seeded = createDefaultState();
      const wrote = await writeToSupabase(seeded);
      if (wrote !== "written") {
        throw new Error("Unable to initialise shared data.");
      }
      return readFromSupabase();
    }

    markSupabaseHealthy();
    return {
      state: sanitizeState(data.value),
      updatedAt: data.updated_at,
    };
  } catch (error) {
    markSupabaseDegraded();
    console.error("Supabase state read failed.", error);
    return null;
  }
}

async function writeToSupabase(state: PlatformState, expectedUpdatedAt?: string) {
  const client = getSupabaseAdminClient();
  if (!client) return "unavailable" as const;

  try {
    if (expectedUpdatedAt) {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .update({ value: state, updated_at: nowIso() })
        .eq("key", SUPABASE_ROW_KEY)
        .eq("updated_at", expectedUpdatedAt)
        .select("updated_at");

      if (error) throw error;
      if (!data?.length) return "conflict" as const;

      markSupabaseHealthy();
      return "written" as const;
    }

    const { error } = await client.from(SUPABASE_TABLE).upsert({
      key: SUPABASE_ROW_KEY,
      value: state,
      updated_at: nowIso(),
    });

    if (error) throw error;
    markSupabaseHealthy();
    return "written" as const;
  } catch (error) {
    markSupabaseDegraded();
    console.error("Supabase state write failed.", error);
    return "unavailable" as const;
  }
}

async function readPlatformStateForUpdate(): Promise<StateForUpdate> {
  if (useMySql()) return readFromMySql();
  const supabaseIsConfigured = Boolean(getSupabaseConfig());
  const supabaseState = await readFromSupabase();
  if (supabaseState) {
    return {
      state: supabaseState.state,
      source: "supabase",
      updatedAt: supabaseState.updatedAt,
    };
  }

  if (supabaseIsConfigured && !allowFileBackend()) {
    throw new Error("The shared data service is temporarily unavailable. Please try again shortly.");
  }

  if (allowFileBackend()) {
    return { state: await readFromFile(), source: "file" };
  }

  return { state: createDefaultState(), source: "memory" };
}

export async function readPlatformState() {
  return (await readPlatformStateForUpdate()).state;
}

export async function updatePlatformState<T>(
  updater: (state: PlatformState) => Promise<T> | T,
) {
  // Supabase updates are optimistic so concurrent customers cannot silently overwrite one another.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readPlatformStateForUpdate();
    const next = cloneState(current.state);
    const result = await updater(next);

    if (current.source === "mysql") {
      if (await writeToMySql(next, current.revision!)) return { result, state: next };
      continue;
    }

    if (current.source === "supabase") {
      const outcome = await writeToSupabase(next, current.updatedAt);
      if (outcome === "written") return { result, state: next };
      if (outcome === "conflict") continue;
      throw new Error("The shared data service is temporarily unavailable. Please try again shortly.");
    }

    if (current.source === "file") {
      await writeToFile(next);
      return { result, state: next };
    }

    throw new Error("Supabase is required for persistent production actions.");
  }

  throw new Error("Your data changed in another session. Please try again.");
}

export function publicUser(user: ServerUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    mfaEnabled: user.mfaEnabled,
    country: user.country,
    address: user.address,
    state: user.state,
    localGovernment: user.localGovernment,
  };
}

export function getIntegrationStatus(): IntegrationStatus {
  const supabaseConfigured = Boolean(getSupabaseConfig());
  const backend = useMySql()
    ? "mysql"
    : supabaseConfigured && supabaseRuntimeState !== "degraded"
    ? "supabase"
    : allowFileBackend()
      ? "filesystem"
      : supabaseConfigured
        ? "supabase"
        : "unconfigured";

  return {
    backend,
    supabaseConfigured,
    flutterwaveConfigured: Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY),
    hostingConfigured: Boolean(process.env.NEXT_PUBLIC_DAJEM_SITE_URL || process.env.URL || process.env.HOSTINGER || process.env.NETLIFY),
  };
}
