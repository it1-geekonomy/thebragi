"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
