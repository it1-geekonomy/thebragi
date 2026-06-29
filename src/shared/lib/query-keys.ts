export const queryKeys = {
  session: ["session"] as const,
  plans: ["plans"] as const,
  checkoutStatus: (id: string) => ["checkoutStatus", id] as const,
  billing: ["billing"] as const,
};
