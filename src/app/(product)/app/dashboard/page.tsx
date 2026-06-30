import { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-8">
      <h1 className="text-4xl font-semibold text-white">Bragi Dashboard</h1>
    </main>
  );
}
