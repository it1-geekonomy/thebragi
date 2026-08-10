import { useCallback } from "react";

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export function useRazorpayCheckout() {
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initializePayment = useCallback(
    async (
      options: RazorpayOptions,
      onSuccess: (response: any) => void,
      onError: (error: any) => void
    ) => {
      const isLoaded = await loadRazorpayScript();
      
      if (!isLoaded) {
        onError(new Error("Razorpay SDK failed to load. Are you offline?"));
        return;
      }

      const rzpOptions = {
        ...options,
        handler: function (response: any) {
          onSuccess(response);
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);

      rzp.on("payment.failed", function (response: any) {
        onError(response.error);
      });

      rzp.open();
    },
    [loadRazorpayScript]
  );

  return { initializePayment };
}
