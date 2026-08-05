export type PlanFeature = {
  label: string;
  included: boolean;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  features: PlanFeature[];
  popular?: boolean;
  badge?: string;
  /** Included-only labels for compact lists (checkout, teaser). */
  modules: string[];
};

export const planCatalog: Plan[] = [
  {
    id: "bragi-sales",
    slug: "bragi-sales",
    name: "Sales CRM",
    description: "Leads, deals, contacts, clients and targets.",
    priceMonthly: 649,
    modules: [
      "Lead capture & qualification",
      "Lead pipeline & forecasting",
      "Contacts & corp. records",
      "Targets & sales hierarchy",
    ],
    features: [
      { label: "Lead capture & qualification", included: true },
      { label: "Lead pipeline & forecasting", included: true },
      { label: "Contacts & corp. records", included: true },
      { label: "Targets & sales hierarchy", included: true },
      { label: "Projects & task delivery", included: false },
      { label: "Milestones & invoicing", included: false },
    ],
  },
  {
    id: "bragi-full",
    slug: "bragi-full",
    name: "Complete Suite",
    description: "The full lead-to-cash loop end-to-end.",
    priceMonthly: 1099,
    popular: true,
    badge: "Most popular — save 20%",
    modules: [
      "Everything in Sales CRM",
      "Everything in Project Management",
      "Lead → Deal → Client → Project chain",
      "Action-triggered invoicing",
      "Cross-module reporting",
      "Priority onboarding support",
    ],
    features: [
      { label: "Everything in Sales CRM", included: true },
      { label: "Everything in Project Management", included: true },
      { label: "Lead → Deal → Client → Project chain", included: true },
      { label: "Action-triggered invoicing", included: true },
      { label: "Cross-module reporting", included: true },
      { label: "Priority onboarding support", included: true },
    ],
  },
  {
    id: "bragi-projects",
    slug: "bragi-projects",
    name: "Project Management",
    description: "Projects, task templates, milestones, invoicing.",
    priceMonthly: 749,
    modules: [
      "Projects & project types",
      "Milestones, tasks & time logs",
      "Milestones & client invoicing",
      "Departmental teams with roles",
    ],
    features: [
      { label: "Projects & project types", included: true },
      { label: "Milestones, tasks & time logs", included: true },
      { label: "Milestones & client invoicing", included: true },
      { label: "Departmental teams with roles", included: true },
      { label: "Lead & deal pipeline", included: false },
      { label: "Sales targets", included: false },
    ],
  },
];

export function getPlanBySlug(slug?: string) {
  return planCatalog.find((plan) => plan.slug === slug) ?? planCatalog.find((plan) => plan.popular) ?? planCatalog[0];
}
