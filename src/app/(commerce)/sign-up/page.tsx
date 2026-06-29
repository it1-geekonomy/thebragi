import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default function SignUpPage() {
  redirect(`${ROUTES.pricing}?message=choose-plan`);
}
