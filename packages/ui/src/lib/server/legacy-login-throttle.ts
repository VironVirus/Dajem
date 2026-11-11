const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_ENTRIES = 5000;
const attempts = new Map<string, { failures: number; expiresAt: number }>();

export function legacyLoginKey(email: string, ip: string) {
  return `${email.trim().toLowerCase()}|${ip.trim().slice(0, 100)}`;
}

export function assertLegacyLoginAllowed(key: string) {
  const current = attempts.get(key);
  if (current && current.expiresAt > Date.now() && current.failures >= MAX_FAILURES) {
    throw new Error("Too many sign-in attempts. Please try again in 15 minutes or reset your password.");
  }
}

export function recordLegacyLoginFailure(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (attempts.size >= MAX_ENTRIES && !attempts.has(key)) {
    for (const [entry, value] of attempts) {
      if (value.expiresAt <= now) attempts.delete(entry);
    }
    if (attempts.size >= MAX_ENTRIES) attempts.delete(attempts.keys().next().value!);
  }
  attempts.set(key, current && current.expiresAt > now
    ? { failures: current.failures + 1, expiresAt: current.expiresAt }
    : { failures: 1, expiresAt: now + WINDOW_MS });
}

export function clearLegacyLoginFailures(key: string) {
  attempts.delete(key);
}
