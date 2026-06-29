export const ROUTES = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  contact: "/contact",
  checkout: (plan: string) => `/checkout?plan=${plan}`,
  signIn: "/sign-in",
  signUp: "/sign-up",
  verify: "/verify",
  dashboard: "/app/dashboard",
  onboarding: "/app/onboarding",
  account: {
    profile: "/account/profile",
    billing: "/account/billing",
  },
  products: {
    sales: "/products/sales",
    projects: "/products/projects",
    full: "/products/full",
  },
  legal: {
    privacy: "/legal/privacy",
    terms: "/legal/terms",
  },
};
