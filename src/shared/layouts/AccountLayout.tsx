import { AccountShell } from "@/shared/components/layout/AccountShell";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
