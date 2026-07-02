export function getCrmLoginUrl(host?: string | null): string {
  if (process.env.NEXT_PUBLIC_CRM_URL) {
    return `${process.env.NEXT_PUBLIC_CRM_URL.replace(/\/$/, "")}/auth/login`;
  }

  if (process.env.NODE_ENV === "development" && host) {
    const hostname = host.split(":")[0];
    return `http://${hostname}:3000/auth/login`;
  }

  return "https://crm.geekonomy.in/auth/login";
}
