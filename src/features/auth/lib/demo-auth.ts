import type { SubscriptionStatus } from "@/store";

export type DemoUser = {
  email: string;
  password: string;
  name: string;
  subscriptionStatus: SubscriptionStatus;
  activePlan: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    email: "demo@bragi.local",
    password: "demo12345",
    name: "Demo User",
    subscriptionStatus: "active",
    activePlan: "bragi-full",
  },
  {
    email: "expired@bragi.local",
    password: "demo12345",
    name: "Expired User",
    subscriptionStatus: "none",
    activePlan: "bragi-full",
  },
];

export const PRIMARY_DEMO_USER = DEMO_USERS[0];

export function matchDemoUser(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((user) => user.email === normalized && user.password === password) ?? null;
}
