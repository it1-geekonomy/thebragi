"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { store } from "@/store";
import "react-toastify/dist/ReactToastify.css";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="top-right" />
      <ToastContainer position="top-right" newestOnTop theme="dark" />
    </Provider>
  );
}
