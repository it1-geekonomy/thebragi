import { Accordion } from "@/shared/components/ui/Accordion";

const items = [
  { title: "Can I change plans later?", content: "Yes. This frontend is plan-ready, and the billing area is prepared for plan-change flows once commerce APIs are connected." },
  { title: "Are prices final?", content: "These are preview INR prices. The pricing UI already expects plan data to come from GET /v1/plans when backend work begins." },
  { title: "Do I need an account first?", content: "No. Bragi follows a plan-first flow: choose a plan, then create or sign in during checkout." },
  { title: "What happens after checkout?", content: "The frontend success route is prepared for provisioning, password creation, and then opening the Bragi app shell." },
];

export function PricingFAQ() {
  return <Accordion items={items} />;
}
