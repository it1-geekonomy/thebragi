import { ROUTES } from "@/config/routes";

export const products = {
  sales: {
    key: "sales",
    title: "Bragi Sales",
    slug: "bragi-sales",
    checkoutPlan: "bragi-sales",
    href: ROUTES.products.sales,
    image: "/products/sales.svg",
    audience: "Founder-led teams closing deals without a sales ops layer.",
    description: "Capture leads, move deals, and keep pipeline notes connected to delivery.",
    heroHeadline: "A focused sales workspace for teams that need momentum, not ceremony.",
    features: ["Lead and deal tracking", "Pipeline stages", "Follow-up focus", "Revenue snapshots"],
  },
  projects: {
    key: "projects",
    title: "Bragi Projects",
    slug: "bragi-projects",
    checkoutPlan: "bragi-projects",
    href: ROUTES.products.projects,
    image: "/products/projects.svg",
    audience: "Delivery teams managing client work after the deal is won.",
    description: "Plan projects, assign tasks, and keep delivery visible across the company.",
    heroHeadline: "Project delivery that stays close to the customer promise.",
    features: ["Project boards", "Tasks and owners", "Delivery status", "Client-ready summaries"],
  },
  full: {
    key: "full",
    title: "Bragi Full",
    slug: "bragi-full",
    checkoutPlan: "bragi-full",
    href: ROUTES.products.full,
    image: "/products/full.svg",
    audience: "Teams that want one operating view from first lead to finished work.",
    description: "Unify sales and projects so handoffs stop disappearing between tools.",
    heroHeadline: "The full Bragi workspace, from pipeline to completed project.",
    features: ["Sales and project modules", "Unified dashboard", "Cross-team handoffs", "Billing-ready plan"],
  },
} as const;

export type ProductKey = keyof typeof products;
