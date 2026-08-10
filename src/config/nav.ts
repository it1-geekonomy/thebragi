import { ROUTES } from "@/config/routes";

export const marketingNav = [
  { label: "Pricing", href: ROUTES.pricing },
  { label: "Contact", href: ROUTES.contact },
];

export const footerColumns = [
  {
    title: "Plans",
    links: [{ label: "Pricing", href: ROUTES.pricing }],
  },
  {
    title: "Company",
    links: [
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
];
