import { Accordion } from "@/shared/components/ui/Accordion";

const items = [
  { title: "Can I change plans later?", content: "Yes. Pick Sales CRM, Project Management, or Complete Suite — you can move between them later from billing." },
  { title: "Are prices final?", content: "These are static INR preview prices (per user / month). GST is extra. Annual billing saves 20%." },
  { title: "Do I need an account first?", content: "No. Bragi follows a plan-first flow: choose a plan, then create or sign in during checkout." },
  { title: "What happens after checkout?", content: "The frontend success route is prepared for provisioning, password creation, and then opening the Bragi app shell." },
];

export function PricingFAQ() {
  return <Accordion items={items} />;
}
