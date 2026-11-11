export function mockPaymentsAllowed(environment: string | undefined) {
  return environment !== "production";
}
