const TRIAL_DAYS = 14;

export function createTrialWindow(start = new Date()) {
  const trialStartedAt = start.toISOString();
  const trialEndsAt = new Date(start);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
  return { trialStartedAt, trialEndsAt: trialEndsAt.toISOString() };
}

export function formatTrialDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
