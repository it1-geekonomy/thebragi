"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";
import { AuthInitializer } from "./AuthInitializer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <Toaster richColors position="top-right" />
      </AuthInitializer>
    </Provider>
  );
}
