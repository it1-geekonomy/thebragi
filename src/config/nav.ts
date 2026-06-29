import { ROUTES } from "@/config/routes";
import { products } from "@/config/products";

export const marketingNav = [
  {
    label: "Products",
    items: [
      { label: products.sales.title, href: products.sales.href },
      { label: products.projects.title, href: products.projects.href },
      { label: products.full.title, href: products.full.href },
    ],
  },
  { label: "Pricing", href: ROUTES.pricing },
  { label: "Features", href: ROUTES.features },
  { label: "Contact", href: ROUTES.contact },
];

export const footerColumns = [
  {
    title: "Products",
    links: [
      { label: products.sales.title, href: products.sales.href },
      { label: products.projects.title, href: products.projects.href },
      { label: products.full.title, href: products.full.href },
    ],
  },
  {
    title: "Plans",
    links: [{ label: "Pricing", href: ROUTES.pricing }],
  },
  {
    title: "Company",
    links: [
      { label: "Features", href: ROUTES.features },
      { label: "Contact", href: ROUTES.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: ROUTES.legal.privacy },
      { label: "Terms", href: ROUTES.legal.terms },
    ],
  },
];

export const productNav = [
  { label: "Dashboard", href: ROUTES.dashboard, module: null },
  { label: "Sales", href: "/app/sales", module: "sales" },
  { label: "Projects", href: "/app/projects", module: "projects" },
  { label: "Settings", href: "/app/settings", module: null },
];
