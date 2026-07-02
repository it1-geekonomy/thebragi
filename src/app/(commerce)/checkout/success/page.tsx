import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCrmLoginUrl } from "@/config/crm";

export default async function CheckoutSuccessPage() {
  const host = (await headers()).get("host");
  redirect(getCrmLoginUrl(host));
}
