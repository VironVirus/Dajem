/**
 * Input aliases are deliberately limited to the CLIC rules approved in Phase 2.
 * The catalogue itself is server-side platform data and is never imported here.
 */
export function canonicalizeLiftingPlotInput(estateId: string, rawValue: string) {
  const value = rawValue.trim().toUpperCase();
  if (estateId !== "clic-estate") return value.replace(/\s+/g, " ");

  const compact = value
    .replace(/^(?:PLOT(?:\s+NUMBER|\s+NO\.?)?|NO\.)\s*[:#]?\s*/i, "")
    .replace(/[\s\-/]+/g, "");
  const match = /^(0*)(\d{1,2})([AB])$/.exec(compact);
  if (!match) return "";
  return `${Number(match[2])}${match[3]}`;
}
